# Load Testing Quick Start

## What You Have

7 comprehensive K6 load test scripts ready to execute:

```
k6/
  ├── baseline.js           (10 min)   - Measure current performance
  ├── ramp_up.js            (42 min)   - Find optimal capacity (50→5000 users)
  ├── spike_test.js         (10 min)   - Verify graceful degradation
  ├── mixed_scenarios.js    (20 min)   - Realistic user behavior
  ├── chaos_test.js         (25 min)   - Verify failover & recovery
  ├── soak_test.js          (4 hours)  - Detect memory leaks
  └── stress_test.js        (15 min)   - Find breaking point
```

**Total Runtime:** ~5.5 hours (includes 4-hour soak test)

## Installation

### 1. Install K6

**Windows (PowerShell):**

```powershell
choco install k6
```

**macOS:**

```bash
brew install k6
```

**Linux:**

```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6-stable.list
sudo apt-get update
sudo apt-get install k6
```

### 2. Start Your Backend

```bash
# In project root
docker-compose up -d

# Verify it's running
curl http://localhost/health
```

### 3. Run Tests

```bash
# Run all tests in sequence (5.5 hours)
./run_load_tests.sh staging all

# Run specific test
./run_load_tests.sh staging baseline       # 10 minutes
./run_load_tests.sh staging rampup         # 42 minutes
./run_load_tests.sh staging spike          # 10 minutes
./run_load_tests.sh staging mixed          # 20 minutes
./run_load_tests.sh staging chaos          # 25 minutes
./run_load_tests.sh staging soak           # 4 hours
./run_load_tests.sh staging stress         # 15 minutes
```

## Manual Execution (Without Script)

```bash
# Baseline test
k6 run k6/baseline.js --out json=results/baseline.json

# Ramp-up test (this is the important one!)
k6 run k6/ramp_up.js --out json=results/rampup.json

# View results
cat results/baseline.json | jq '.metrics'
```

## Reading Results

### Baseline Test (10 min)

```
Expected: <1% errors, <200ms P95 latency
Pass/Fail: System is stable (proceed to ramp-up)
```

### Ramp-Up Test (42 min) ⭐ MOST IMPORTANT

```
Tracks: 50→500→1000→2000→3000→4000→5000 users
Breaking Point = where error rate spikes from <5% to >20%
Example: Breaking point at 3500 users = 3500 concurrent capacity
```

### Spike Test (10 min)

```
Expected: Error spike during high load, recovery <2 minutes
Pass: System handles sudden traffic without cascading failures
```

### Mixed Scenarios (20 min)

```
Expected: Regular users <1% error, power users <2% error
Pass: System fair under mixed workloads
```

### Chaos Test (25 min)

```
Injects: Backend failures during load
Expected: Automatic failover, <10% error rate with 1 backend down
Pass: Failover mechanism works correctly
```

### Soak Test (4 hours)

```
Constant: 500 concurrent users
Checks: Memory leaks, connection exhaustion
Expected: Memory stable, latency flat
Pass: No degradation over time
```

### Stress Test (15 min)

```
Ramps: 500→10,000 users aggressively
Finds: Exact breaking point (target 50%+ errors)
Result: Confirms breaking point from ramp-up test
```

## Interpreting Results

### Green Light (Safe to Deploy) ✅

```
✅ Breaking Point > 3000 concurrent users
✅ Baseline error rate < 1%
✅ Memory stable over 4 hours
✅ Error rate < 10% during single backend failure
✅ Recovery time < 5 seconds
```

### Yellow Light (Investigate) ⚠️

```
⚠️ Breaking Point 1500-3000 users
⚠️ Error rate 1-5% at baseline
⚠️ Memory growth 10-50% over 4 hours
⚠️ Recovery time 5-10 seconds
```

### Red Light (Do Not Deploy) ❌

```
❌ Breaking Point < 1500 users
❌ Baseline error rate > 5%
❌ Memory growth > 50% (leak detected)
❌ Error rate > 25% during single backend failure
❌ Cascading failures or 502 errors
```

## Production Capacity Calculation

Once you know the breaking point:

```
Breaking Point: X concurrent users
Safe Capacity: X × 0.6 (60%)
Auto-scale Trigger: X × 0.75 (75%)
Alert Threshold: X × 0.8 (80%)

Example (Breaking Point = 5000):
Safe Capacity = 3000
Auto-scale Trigger = 3750
Alert Threshold = 4000
```

## Monitoring During Tests

Open in another terminal:

```bash
# Watch Docker stats
docker stats

# Watch logs
docker logs -f boltlink-platform-backend-1

# Watch nginx
docker logs -f boltlink-platform-nginx-1

# Monitor Grafana (if running)
# http://localhost:3000
```

## Troubleshooting

### "k6 command not found"

```bash
# Install k6
# See Installation section above
```

### "Connection refused"

```bash
# Backend not running
docker-compose up -d

# Check if running
docker ps
```

### "Tests running slow"

```bash
# Check system resources
docker stats

# Backend might be hitting limits
# Consider reducing concurrent users in test
```

### "High error rate at baseline"

```bash
# Investigate:
1. Backend logs: docker logs boltlink-platform-backend-1
2. Database: docker exec boltlink-platform-postgres-1 psql -l
3. Redis: docker exec boltlink-platform-redis-1 redis-cli PING
4. Nginx: docker logs boltlink-platform-nginx-1
```

## Next Steps After Testing

1. **Document Results**
   - Save `results/*.json` files
   - Record breaking point number
   - Note any memory leaks detected

2. **Production Configuration**

   ```bash
   # Calculate required instances
   expected_peak = 5000  # concurrent users
   breaking_point = 3500  # from ramp-up test
   safe_capacity = breaking_point * 0.6  # = 2100
   instances_needed = ceil(expected_peak / safe_capacity)  # = 3
   ```

3. **Production Deployment**
   - Update docker-compose: 3+ instances
   - Configure auto-scaling
   - Set up alerting
   - Deploy to staging first
   - Run light load test in staging
   - Deploy to production

4. **Monitor After Deployment**
   - Watch first 24 hours closely
   - Compare real traffic patterns to test results
   - Adjust auto-scaling if needed
   - Gradually increase traffic

## Files Created for You

| File                       | Purpose                             |
| -------------------------- | ----------------------------------- |
| `k6/baseline.js`           | Establish baseline performance      |
| `k6/ramp_up.js`            | Find breaking point (50→5000 users) |
| `k6/spike_test.js`         | Test spike handling                 |
| `k6/mixed_scenarios.js`    | Realistic user behavior             |
| `k6/chaos_test.js`         | Verify failover                     |
| `k6/soak_test.js`          | Test for memory leaks (4 hours)     |
| `k6/stress_test.js`        | Push to breaking point              |
| `LOAD_TESTING_PLAN.md`     | Comprehensive testing strategy      |
| `LOAD_TESTING_ANALYSIS.md` | Detailed results interpretation     |
| `run_load_tests.sh`        | Test runner script                  |

## Questions?

Check these files:

- **How to run tests?** → Read this file
- **How to interpret results?** → `LOAD_TESTING_ANALYSIS.md`
- **What's the testing strategy?** → `LOAD_TESTING_PLAN.md`
- **Detailed test code?** → `k6/[test_name].js`

## Summary

You now have:

1. ✅ 7 fully executable K6 test scripts
2. ✅ Comprehensive testing plan
3. ✅ Results interpretation guide
4. ✅ Automated test runner
5. ✅ Production capacity calculator

**You're ready to load test before production deployment!** 🚀

Run: `./run_load_tests.sh staging baseline` to get started
