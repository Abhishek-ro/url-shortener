# Load Testing Suite - Complete Index

## 📚 Documentation Files

### 🚀 Start Here

- **[LOAD_TESTING_QUICKSTART.md](LOAD_TESTING_QUICKSTART.md)** - 5-minute guide to get started
- **[LOAD_TESTING_SUMMARY.md](LOAD_TESTING_SUMMARY.md)** - Complete overview of what's delivered

### 📖 Detailed Guides

- **[LOAD_TESTING_PLAN.md](LOAD_TESTING_PLAN.md)** - Comprehensive testing strategy and methodology
- **[LOAD_TESTING_ANALYSIS.md](LOAD_TESTING_ANALYSIS.md)** - How to interpret test results

## 🧪 Test Scripts (7 Total)

All scripts are in the `k6/` directory:

### Core Tests

| Test        | File                                           | Duration | Purpose                     |
| ----------- | ---------------------------------------------- | -------- | --------------------------- |
| Baseline    | [k6/baseline.js](k6/baseline.js)               | 10 min   | Measure current performance |
| **Ramp-Up** | [k6/ramp_up.js](k6/ramp_up.js)                 | 42 min   | **Find breaking point** ⭐  |
| Spike       | [k6/spike_test.js](k6/spike_test.js)           | 10 min   | Test sudden load surge      |
| Mixed       | [k6/mixed_scenarios.js](k6/mixed_scenarios.js) | 20 min   | Realistic user behavior     |
| Chaos       | [k6/chaos_test.js](k6/chaos_test.js)           | 25 min   | Verify failover             |
| Soak        | [k6/soak_test.js](k6/soak_test.js)             | 4 hours  | Detect memory leaks         |
| Stress      | [k6/stress_test.js](k6/stress_test.js)         | 15 min   | Push to breaking point      |

## 🤖 Test Runners

### Automated Test Execution

- **[run_load_tests.sh](run_load_tests.sh)** - Bash script (Linux/macOS)
- **[run_load_tests.ps1](run_load_tests.ps1)** - PowerShell script (Windows)

Both runners provide:

- ✅ Pre-flight checks
- ✅ Sequential test execution
- ✅ Real-time progress
- ✅ Metric extraction
- ✅ Summary reporting

## 🎯 Quick Command Reference

### Installation

```bash
# Install K6
brew install k6              # macOS
choco install k6             # Windows (PowerShell)
sudo apt-get install k6      # Linux
```

### Running Tests

```bash
# All tests (5.5 hours)
./run_load_tests.sh staging all              # Linux/macOS
.\run_load_tests.ps1 -Environment staging    # Windows

# Single test
./run_load_tests.sh staging baseline         # 10 min
./run_load_tests.sh staging rampup           # 42 min  ⭐
./run_load_tests.sh staging spike            # 10 min
./run_load_tests.sh staging mixed            # 20 min
./run_load_tests.sh staging chaos            # 25 min
./run_load_tests.sh staging soak             # 4 hours
./run_load_tests.sh staging stress           # 15 min
```

### Manual Execution (Without Runner)

```bash
k6 run k6/baseline.js --out json=results/baseline.json
k6 run k6/ramp_up.js --out json=results/rampup.json
# ... etc
```

## 📊 Test Execution Flow

```
┌─────────────────────────────────────────┐
│ LOAD TESTING SUITE - EXECUTION ORDER    │
├─────────────────────────────────────────┤
│ 1️⃣  BASELINE (10 min)                   │
│     └─ Establish current performance    │
│                                         │
│ 2️⃣  RAMP-UP (42 min) ⭐ CRITICAL       │
│     └─ Find breaking point              │
│                                         │
│ 3️⃣  SPIKE (10 min)                     │
│     └─ Verify graceful degradation      │
│                                         │
│ 4️⃣  MIXED SCENARIOS (20 min)           │
│     └─ Test realistic behavior          │
│                                         │
│ 5️⃣  CHAOS (25 min)                     │
│     └─ Validate failover                │
│                                         │
│ 6️⃣  SOAK (4 hours) [Run Overnight]    │
│     └─ Detect memory leaks              │
│                                         │
│ 7️⃣  STRESS (15 min)                    │
│     └─ Confirm breaking point           │
│                                         │
│ ✅ Total: ~5.5 hours                    │
└─────────────────────────────────────────┘
```

## 🎓 Understanding Results

### Breaking Point (Most Important)

The **Ramp-Up Test** identifies your breaking point:

```
Breaking Point = Concurrent users where error rate jumps to >20%

Example Results:
  2000 users: ✅ 2% errors
  3000 users: ✅ 8% errors
  4000 users: ❌ 25% errors ← BREAKING POINT
  5000 users: ❌ 45% errors
```

### Capacity Planning Formula

```
Breaking Point = X users
Safe Capacity = X × 0.6          (60% - production safe level)
Auto-scale at = X × 0.75         (75% - trigger new instances)
Alert threshold = X × 0.8        (80% - warning level)
```

**Example (Breaking Point = 4000):**

```
Safe Capacity: 2400 users
Auto-scale at: 3000 users
Alert at: 3200 users
For 10K peak load: Need 5+ instances
```

## ✅ Pass/Fail Decision Matrix

| Metric              | Target        | Pass      | Fail           |
| ------------------- | ------------- | --------- | -------------- |
| Breaking Point      | >3000 users   | ✅ Deploy | ❌ Optimize    |
| Baseline Errors     | <1%           | ✅        | ❌ Debug       |
| Memory Leak         | None          | ✅        | ❌ Fix         |
| Failover Error Rate | <10% (1 down) | ✅        | ❌ Investigate |
| Recovery Time       | <5 seconds    | ✅        | ⚠️ Monitor     |

## 🔍 Interpreting Each Test

### 1. Baseline (10 min)

**What:** Measure current system performance  
**Metrics:** P95 latency, error rate, throughput  
**Success:** <1% errors, <200ms P95  
**Action:** Proceed if stable; debug if errors

### 2. Ramp-Up (42 min) ⭐ **MOST IMPORTANT**

**What:** Find exact breaking point  
**Metrics:** Error rate by concurrent user count  
**Success:** Breaking point >3000 users  
**Action:** Document breaking point, plan capacity

### 3. Spike (10 min)

**What:** Sudden 10x traffic surge  
**Metrics:** Error spike + recovery time  
**Success:** Errors spike then recover <2 min  
**Action:** Validate failover mechanism

### 4. Mixed Scenarios (20 min)

**What:** Realistic user behavior (70% regular, 20% power, 10% bots)  
**Metrics:** Error rate by user type  
**Success:** Regular users <1%, power users <2%  
**Action:** Confirm fairness under load

### 5. Chaos (25 min)

**What:** Kill backends during load  
**Metrics:** Error rate with failures  
**Success:** <10% errors with 1 backend down  
**Action:** Confirm automatic failover works

### 6. Soak (4 hours)

**What:** Sustained 500 users, monitor for leaks  
**Metrics:** Memory, latency, error rate trends  
**Success:** All metrics stay flat  
**Action:** Confirm long-term stability

### 7. Stress (15 min)

**What:** Aggressive 500→10,000 users ramp  
**Metrics:** Breaking point confirmation  
**Success:** Matches ramp-up breaking point  
**Action:** Validate breaking point measurement

## 📈 Expected Metrics by Test

### Baseline Test

```
Expected Output:
├─ Requests/sec: ~120 req/s
├─ P95 Latency: 100-200ms
├─ Error Rate: <1%
└─ Memory: Stable ~512MB
```

### Ramp-Up Test

```
Expected Progression:
├─ 50 users: ✅ 0% errors, P95=100ms
├─ 500 users: ✅ 0.1% errors, P95=150ms
├─ 1000 users: ✅ 0.5% errors, P95=200ms
├─ 2000 users: ⚠️ 2% errors, P95=400ms
├─ 3000 users: ⚠️ 8% errors, P95=800ms
├─ 4000 users: ❌ 25% errors, P95=2000ms ← BREAKING POINT
└─ 5000 users: ❌ 45% errors, P95=5000ms
```

### Chaos Test

```
Normal: 0% errors
1 Backend Down: 2-10% errors (acceptable)
2 Backends Down: 10-30% errors (degraded)
Recovery: Errors drop <5 seconds (good)
```

## 🛠️ Troubleshooting

### K6 Not Installed

```bash
brew install k6              # macOS
choco install k6             # Windows
sudo apt-get install k6      # Linux
```

### Backend Not Running

```bash
docker-compose up -d
docker logs boltlink-platform-backend-1
```

### High Error Rate at Baseline

```bash
# Check database
docker exec postgres-1 psql -c "SELECT * FROM pg_stat_activity;"

# Check Redis
docker exec redis-1 redis-cli INFO stats

# Check memory
docker stats
```

### Memory Leak Detected

```bash
# Profile Node.js
node --inspect app.js
# Use Chrome DevTools at chrome://inspect
```

## 📋 Pre-Deployment Checklist

- [ ] ✅ Install K6
- [ ] ✅ Start backend (docker-compose up)
- [ ] ✅ Run baseline test (10 min)
- [ ] ✅ Run ramp-up test (42 min)
- [ ] ✅ Identify breaking point
- [ ] ✅ Run spike test (10 min)
- [ ] ✅ Run mixed scenarios (20 min)
- [ ] ✅ Run chaos test (25 min)
- [ ] ✅ Run soak test overnight (4 hours)
- [ ] ✅ Run stress test (15 min)
- [ ] ✅ Review all results
- [ ] ✅ Document findings
- [ ] ✅ Plan production deployment
- [ ] ✅ Configure auto-scaling
- [ ] ✅ Set alert thresholds
- [ ] ✅ Deploy to production

## 🎯 Success Criteria

### Minimum Requirements

✅ Breaking point >2000 concurrent users  
✅ Baseline error rate <2%  
✅ No memory leaks detected  
✅ Failover works (<10% errors)

### Recommended Level

✅ Breaking point >5000 concurrent users  
✅ Baseline error rate <0.5%  
✅ Memory stable over 4 hours  
✅ Recovery time <2 seconds  
✅ P95 latency <250ms at peak

### Excellent Level

✅ Breaking point >8000 concurrent users  
✅ Baseline error rate 0%  
✅ No memory change over 4 hours  
✅ Recovery time <1 second  
✅ P95 latency <150ms at peak

## 📞 Need Help?

1. **Quick Start:** Read [LOAD_TESTING_QUICKSTART.md](LOAD_TESTING_QUICKSTART.md)
2. **Understanding Results:** Read [LOAD_TESTING_ANALYSIS.md](LOAD_TESTING_ANALYSIS.md)
3. **Testing Strategy:** Read [LOAD_TESTING_PLAN.md](LOAD_TESTING_PLAN.md)
4. **Test Scripts:** Check `k6/[test_name].js` for implementation details

## 🚀 You're Ready!

Everything is set up. Load testing will validate your system before production deployment.

**Start with:**

```bash
./run_load_tests.sh staging baseline
```

**Then proceed through the rest of the tests systematically.**

Good luck! 🎉
