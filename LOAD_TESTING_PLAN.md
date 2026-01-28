# Load Testing Strategy for BoltLink URL Shortener

## Executive Summary

This document outlines a comprehensive load testing strategy to determine:

- **Maximum Concurrent Users:** Before response time degradation
- **Peak Throughput:** Requests per second before errors spike
- **Breaking Point:** Where system becomes unstable (>50% error rate)
- **Optimal Configuration:** Resource allocation for production

### Expected Targets (3-Instance Setup)

- **Baseline:** 100-200 concurrent users (healthy)
- **Target Capacity:** 500-1000 concurrent users (stress limit)
- **Absolute Maximum:** 3000-5000 concurrent users (breaking point)
- **Throughput Goal:** 5,000-10,000 RPS (requests per second)

---

## Testing Methodology

### 1. Load Testing (Gradual Ramp-Up)

**Purpose:** Measure system behavior under gradually increasing load

```
Concurrency: 50 → 500 → 1000 → 2000 users
Duration: 5 minutes per stage
Pattern: Linear increase (50 users every 30 seconds)
Metrics: Response time, throughput, error rate
Goal: Find optimal operating range
```

**Expected Results:**

- Response time: <200ms at 500 users
- Error rate: <1% at 1000 users
- Throughput: Linear scaling with users (optimal)

### 2. Stress Testing (Push to Limits)

**Purpose:** Identify system breaking point and failure modes

```
Concurrency: 1000 → 5000 users (aggressive)
Duration: 10 minutes
Pattern: Rapid increase (1000 users per minute)
Metrics: At what point do errors spike? When does service degrade?
Goal: Find "wall" where system can't scale further
```

**Expected Results:**

- Error rate stays <5% up to 3000 users
- Error rate spikes >50% at 4000+ users (breaking point)
- Response time increases exponentially after 3000 users

### 3. Spike Testing (Sudden Traffic Surge)

**Purpose:** Verify system handles unexpected traffic spikes

```
Baseline: 200 concurrent users
Spike: Sudden jump to 2000 users (10x)
Duration: Spike for 2 minutes, then drop
Metrics: Recovery time, queue behavior, error recovery
Goal: Ensure graceful degradation during spikes
```

**Expected Results:**

- Error rate spikes to 5-10% during spike
- Errors resolve when traffic drops
- No cascading failures
- Response time recovers within 5 minutes

### 4. Soak Testing (Sustained Load)

**Purpose:** Detect memory leaks, connection pool exhaustion, cache degradation

```
Concurrency: 500 users (sustainable level)
Duration: 4 hours continuous
Metrics: Memory usage over time, error rate trend, latency creep
Goal: Ensure no degradation over extended operation
```

**Expected Results:**

- Memory usage stays flat (no leaks)
- Error rate remains consistent (<1%)
- Response time stays constant (no degradation)
- Connection pools remain healthy

### 5. Endurance Testing (24-Hour Run)

**Purpose:** Verify production readiness for continuous operation

```
Concurrency: 300 users (average production)
Duration: 24 hours
Metrics: Uptime, error rates, resource usage
Goal: No crashes, no memory leaks, no service degradation
```

**Expected Results:**

- 99.9% uptime (max 8.6 seconds downtime)
- Consistent error rate throughout
- Steady memory/CPU usage
- Graceful handling of any issues

---

## Performance Thresholds & SLAs

### Response Time Targets

| Metric      | Target | Warning | Critical |
| ----------- | ------ | ------- | -------- |
| P50 Latency | <100ms | >150ms  | >300ms   |
| P95 Latency | <200ms | >300ms  | >500ms   |
| P99 Latency | <400ms | >600ms  | >1000ms  |

### Throughput Goals

| Metric           | Target | Warning | Critical |
| ---------------- | ------ | ------- | -------- |
| Requests/sec     | 10,000 | 8,000   | 5,000    |
| Concurrent Users | 1,000  | 750     | 500      |

### Error Rate Limits

| Condition        | Target | Warning | Critical |
| ---------------- | ------ | ------- | -------- |
| Normal Operation | <0.1%  | 0.5%    | >1%      |
| Stress Test      | <1%    | 2%      | >5%      |
| Spike Event      | <5%    | 10%     | >25%     |

### Availability SLA

| Period    | Target | Max Downtime |
| --------- | ------ | ------------ |
| Per hour  | 99.99% | 3.6 seconds  |
| Per day   | 99.95% | 43 seconds   |
| Per month | 99.9%  | 8.6 minutes  |

---

## Test Environment Setup

### Hardware Requirements

**Load Generator Machine**

- CPU: 4+ cores
- RAM: 8GB minimum
- Network: 1Gbps connection (or dedicated)
- OS: Linux recommended

**SUT (System Under Test)**

- 3 backend instances (2 CPU / 4GB RAM each)
- PostgreSQL (1 CPU / 2GB RAM)
- Redis (1 CPU / 1GB RAM)
- nginx load balancer (1 CPU / 512MB RAM)

### K6 Configuration

```javascript
// Recommended K6 settings
export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50
    { duration: '5m', target: 500 }, // Ramp up to 500
    { duration: '10m', target: 1000 }, // Ramp up to 1000
    { duration: '5m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
  },
};
```

---

## Test Scenarios

### Scenario 1: Link Creation Heavy (30%)

- POST /api/links (create short URL)
- Heavy database writes
- Cache invalidation
- Most demanding operation

### Scenario 2: Link Redirect (60%)

- GET /:shortCode (follow short URL)
- High throughput
- Minimal database (cached)
- Most common operation

### Scenario 3: Analytics Query (10%)

- GET /api/analytics
- Database aggregation query
- Lower frequency
- Can cause spikes if not optimized

### Scenario 4: API Key Validation (continuous)

- Rate limiting checks on every request
- Background operation
- Should be <1ms

---

## K6 Test Scripts

### Script Files Generated:

1. **baseline.js** - Measure current performance
2. **ramp_up.js** - Gradual load increase (50→5000 users)
3. **spike_test.js** - Sudden 10x traffic spike
4. **stress_test.js** - Push to breaking point
5. **soak_test.js** - 4-hour sustained load
6. **mixed_scenarios.js** - Realistic traffic patterns
7. **chaos_test.js** - Simulate backend failures
8. **reporting.js** - Generate detailed test reports

### Running Tests

```bash
# Install K6
curl https://github.com/grafana/k6/releases/download/v0.41.0/k6-v0.41.0-linux-amd64.tar.gz | tar xz

# Run baseline test
./k6 run baseline.js

# Run ramp-up test
./k6 run ramp_up.js

# Run with output to file
./k6 run --out json=results.json spike_test.js

# Run with live output to Grafana
./k6 run --out influxdb=http://localhost:8086/k6 stress_test.js
```

---

## Expected Performance Metrics

### Single Backend Instance (1 vCPU, 2GB RAM)

- **Throughput:** 1,500-2,000 RPS
- **Concurrent Users:** 200-300
- **P95 Latency:** <200ms
- **Error Rate:** <0.1%

### 3-Instance Cluster with nginx

- **Throughput:** 4,500-6,000 RPS
- **Concurrent Users:** 600-1000
- **P95 Latency:** <200ms (with connection pooling)
- **Error Rate:** <0.1%

### With Redis Caching

- **Throughput:** 8,000-10,000 RPS
- **Concurrent Users:** 1000-1500
- **P95 Latency:** <150ms (cache hits)
- **Error Rate:** <0.05%

---

## Bottleneck Identification

### What Limits Throughput?

1. **Database Connection Pool** (Most likely bottleneck)
   - Default: 10 connections
   - Increase to 20-30 for load testing
   - Each connection can handle ~50 concurrent queries

2. **Backend CPU** (Second bottleneck)
   - Typically saturates at 80% CPU
   - Each core ~1500 RPS
   - Vertical scaling hits limit at 16 cores

3. **Network Bandwidth** (Less likely)
   - Each response ~500 bytes average
   - 10,000 RPS × 500 bytes = 50 Mbps
   - Most networks handle this easily

4. **Redis Connection Pool** (If caching is heavy)
   - Default: 50 connections
   - Each can handle ~1000 operations/sec
   - Total: 50,000 ops/sec capacity

5. **Memory Leaks** (Found during soak tests)
   - Monitor Node.js heap
   - Watch for gradual increase over hours
   - Investigate if memory > 1GB after 1 hour

---

## Analysis & Reporting

### Metrics to Track

```javascript
{
  // Response time distribution
  'http_req_duration': {
    'p50': 45,     // Median
    'p95': 180,    // 95th percentile
    'p99': 350,    // 99th percentile
    'p99.9': 800,  // 99.9th percentile
    'max': 2500,   // Maximum
    'min': 10,     // Minimum
    'avg': 120,
  },

  // Errors
  'http_req_failed': {
    'rate': 0.005,        // 0.5% error rate
    'count': 500,         // Total errors
    'by_status': {
      '500': 200,         // Server errors
      '502': 100,         // Bad gateway
      '429': 200,         // Rate limited
    }
  },

  // Throughput
  'http_reqs': {
    'rate': 5000,         // RPS
    'total': 180000,      // Total requests
  },

  // Connection metrics
  'connection_pooling': {
    'active': 45,         // Active connections
    'idle': 5,            // Idle connections
    'waiting': 0,         // Waiting for connection
  },

  // Resource usage
  'backend_resources': {
    'cpu_avg': 65,        // Average CPU %
    'cpu_peak': 95,       // Peak CPU %
    'memory_avg': 780,    // Average MB
    'memory_peak': 950,   // Peak MB
  }
}
```

### Report Generation

After each test:

1. Export results as JSON
2. Plot response time percentiles
3. Graph error rate over time
4. Identify failure modes
5. Recommend optimizations

---

## Breaking Point Analysis

### How to Identify the Breaking Point

1. **Error Rate Spike**

   ```
   - 0-500 users: 0% errors (stable)
   - 500-1000 users: 0-1% errors (acceptable)
   - 1000-2000 users: 1-5% errors (stressed)
   - 2000-3000 users: 5-25% errors (very stressed)
   - 3000+ users: >50% errors (BREAKING POINT ❌)
   ```

2. **Response Time Explosion**

   ```
   - 0-500 users: P95 <200ms (linear scaling)
   - 500-1000 users: P95 <300ms (slight degradation)
   - 1000-2000 users: P95 <1s (noticeable)
   - 2000-3000 users: P95 <5s (very slow)
   - 3000+ users: P95 >10s (BREAKING POINT ❌)
   ```

3. **Queue Buildup**
   - Requests waiting in nginx queue
   - Queue depth increases exponentially
   - When queue > pool size × 2, system is over capacity

4. **Resource Exhaustion**
   - CPU pinned at 100% with queue building = CPU-bound
   - Memory > 90% = Memory leak or cache explosion
   - Connections = 100% of pool size = Connection pool exhaustion

### What Happens at Breaking Point?

- Request queue grows indefinitely
- New requests timeout (>30 seconds)
- Connections keep TCP socket open (resource leak)
- Eventually leads to:
  - Out of memory (OOM) crash
  - File descriptor exhaustion
  - Full system hang

---

## Optimization Recommendations

### If CPU is the Bottleneck

- Upgrade to higher CPU instances
- Add 4th/5th backend instance
- Profile code for hot spots
- Consider compiled runtime (Go/Rust for I/O)

### If Database is the Bottleneck

- Increase connection pool (20-30 connections)
- Add database replicas for read scaling
- Implement query caching (Redis)
- Add database indexes on frequently queried columns
- Consider database replication (Phase 5)

### If Memory is the Bottleneck

- Check for memory leaks (soak test for 24h)
- Reduce cache TTL (or size)
- Use streaming responses for large data
- Implement garbage collection tuning

### If Network is the Bottleneck

- Compress responses (already done: gzip)
- Reduce response payload size
- Use connection keep-alive (already configured)
- Upgrade network connection
- Move to CDN for static content

---

## Pre-Deployment Checklist

- [ ] Run baseline test on staging environment
- [ ] Run 30-minute ramp-up test (0→1000 users)
- [ ] Run spike test (200 users → 2000 users)
- [ ] Run 4-hour soak test at 500 concurrent users
- [ ] Run 24-hour endurance test at 300 concurrent users
- [ ] Identify breaking point (where does error rate spike >50%?)
- [ ] Verify P95 latency target achieved
- [ ] Check for memory leaks (stable memory after 1 hour)
- [ ] Verify rate limiting is working correctly
- [ ] Confirm Grafana dashboards show correct metrics
- [ ] Test failover (kill one backend, verify recovery)
- [ ] Generate final report with recommendations

---

## Monitoring During Load Tests

### Key Metrics to Watch (Real-Time)

In Grafana dashboard, monitor:

1. **Request Rate** - Should increase linearly with load
2. **Error Rate** - Should stay <1% until breaking point
3. **Response Time P95** - Should stay <300ms
4. **Backend CPU** - Should scale with requests
5. **Memory Usage** - Should stay flat (no leaks)
6. **Database Connections** - Should not hit max
7. **Queue Depth** - Should stay <10 requests
8. **Rate Limiting Activity** - Should be minimal

If any metric "goes red":

1. Note the exact concurrency level
2. Take screenshot for report
3. Note the timestamp
4. Continue or stop based on test objective

---

## Test Execution Schedule

### Pre-Deployment (This Week)

- [ ] Monday: Baseline + Ramp-up tests
- [ ] Tuesday: Spike + Stress tests
- [ ] Wednesday: Soak test (4 hours)
- [ ] Thursday: Endurance test (24 hours)
- [ ] Friday: Analysis & Optimization

### Results Summary

- Breaking point: **\_** concurrent users
- Optimal capacity: **\_** concurrent users
- Throughput ceiling: **\_** RPS
- P95 latency at optimal: **\_** ms
- Recommendation: Scale to **\_** instances

---

## Cost Analysis

### Load Testing Infrastructure

- Load generator (t3.large): $0.10/hour
- Monitoring (Prometheus/Grafana): $0.05/hour
- Total per test: $1-5 depending on duration

### Production Configuration Recommendation

Based on breaking point analysis:

- If breaks at 2000 users → Use 3 instances (current)
- If breaks at 5000 users → Use 5 instances
- If breaks at 10000 users → Use 8-10 instances

---

## Next Steps

1. **Install K6** on load generator machine
2. **Run baseline test** to establish baseline metrics
3. **Run ramp-up test** to find optimal capacity
4. **Run spike/stress tests** to find breaking point
5. **Run soak test** to check for leaks
6. **Analyze results** and recommend optimizations
7. **Scale infrastructure** if needed
8. **Re-test** after scaling
