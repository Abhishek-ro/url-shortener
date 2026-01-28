# Phase 1.4: Monitoring Dashboard Setup Guide

## Overview

BoltLink now has production-grade monitoring with:

- **Prometheus**: Metrics collection & storage (15-second intervals)
- **Grafana**: Visualization dashboards (auto-refresh 10s)
- **Alert Rules**: 20+ automated alerts for critical issues
- **Exporters**: nginx, Redis, PostgreSQL, Node (system metrics)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   MONITORING STACK                      │
├─────────────────────────────────────────────────────────┤
│  Data Collection (Exporters)                            │
│  ├── nginx_prometheus_exporter (port 4040)              │
│  ├── redis_exporter (port 9121)                         │
│  ├── postgres_exporter (port 9187)                      │
│  └── node_exporter (port 9100) on each server           │
│                                                          │
│  Metrics Storage (Prometheus)                           │
│  ├── localhost:9090/metrics                             │
│  └── Storage: 15GB (2 weeks retention default)          │
│                                                          │
│  Visualization (Grafana)                                │
│  ├── localhost:3000                                     │
│  ├── Pre-built dashboards (nginx, backends, DB)         │
│  └── Alert notification management                      │
└─────────────────────────────────────────────────────────┘
```

## Installation

### 1. Install Prometheus

**Linux (Ubuntu/Debian):**

```bash
# Download latest release
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvfz prometheus-2.40.0.linux-amd64.tar.gz
cd prometheus-2.40.0.linux-amd64

# Copy config
cp prometheus.yml /etc/prometheus/

# Start Prometheus
./prometheus --config.file=/etc/prometheus/prometheus.yml
```

**macOS:**

```bash
brew install prometheus
brew services start prometheus
cp prometheus.yml /opt/homebrew/etc/prometheus/prometheus.yml
brew services restart prometheus
```

**Docker (Recommended for local testing):**

```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  -v $(pwd)/alert_rules.yml:/etc/prometheus/alert_rules.yml \
  prom/prometheus
```

### 2. Install Grafana

**Linux:**

```bash
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
sudo apt-get install grafana-server
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

**macOS:**

```bash
brew install grafana
brew services start grafana
```

**Docker:**

```bash
docker run -d \
  --name grafana \
  -p 3000:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  grafana/grafana
```

### 3. Install Exporters

#### nginx Prometheus Exporter

```bash
# Download
wget https://github.com/nginxinc/nginx-prometheus-exporter/releases/download/v0.11.0/nginx-prometheus-exporter_0.11.0_linux_amd64.tar.gz
tar xvfz nginx-prometheus-exporter_0.11.0_linux_amd64.tar.gz

# Run (connects to nginx status page)
./nginx-prometheus-exporter -nginx.scrape-uri=http://localhost/nginx_status -web.telemetry-path=/metrics -web.listen-address=:4040
```

#### Redis Exporter

```bash
# Docker
docker run -d \
  --name redis-exporter \
  -p 9121:9121 \
  oliver006/redis_exporter --redis-addr=redis.internal:6379

# Or standalone
wget https://github.com/oliver006/redis_exporter/releases/download/v1.45.0/redis_exporter-v1.45.0.linux-amd64.tar.gz
tar xvfz redis_exporter-v1.45.0.linux-amd64.tar.gz
./redis_exporter --redis-addr=redis.internal:6379 --web.listen-address=:9121
```

#### PostgreSQL Exporter

```bash
# Docker
docker run -d \
  --name postgres-exporter \
  -p 9187:9187 \
  -e DATA_SOURCE_NAME="postgresql://postgres:password@postgres.internal:5432/boltlink?sslmode=disable" \
  prometheuscommunity/postgres-exporter

# Or standalone
wget https://github.com/prometheus-community/postgres_exporter/releases/download/v0.11.1/postgres_exporter-0.11.1.linux-amd64.tar.gz
tar xvfz postgres_exporter-0.11.1.linux-amd64.tar.gz
./postgres_exporter --web.listen-address=:9187
```

#### Node Exporter (System Metrics)

```bash
# Install on each backend server
wget https://github.com/prometheus/node_exporter/releases/download/v1.5.0/node_exporter-1.5.0.linux-amd64.tar.gz
tar xvfz node_exporter-1.5.0.linux-amd64.tar.gz
./node_exporter --web.listen-address=:9100
```

### 4. Configure Prometheus

Replace `/etc/prometheus/prometheus.yml` with provided [prometheus.yml](prometheus.yml):

```bash
cp prometheus.yml /etc/prometheus/prometheus.yml
cp alert_rules.yml /etc/prometheus/alert_rules.yml

# Validate config
prometheus --config.file=/etc/prometheus/prometheus.yml --dry-run

# Reload
killall -HUP prometheus
```

### 5. Configure Grafana

1. **Access Grafana:** `http://localhost:3000`
2. **Default credentials:** admin / admin
3. **Add Prometheus Data Source:**
   - Settings → Data Sources → Add
   - URL: `http://localhost:9090`
   - Save & Test
4. **Import Dashboard:**
   - Dashboards → Import
   - Upload [grafana-dashboard.json](grafana-dashboard.json)
   - Select Prometheus as datasource

### 6. Setup Alerts (Optional)

```bash
# Install Alertmanager
wget https://github.com/prometheus/alertmanager/releases/download/v0.25.0/alertmanager-0.25.0.linux-amd64.tar.gz
tar xvfz alertmanager-0.25.0.linux-amd64.tar.gz

# Configure and run
./alertmanager --config.file=alertmanager.yml
```

## Metrics Collected

### nginx / Load Balancer

- **Request counts** by status, method, path
- **Request latency** (p50, p95, p99)
- **Upstream health** (active/down servers)
- **Connection counts** (active, idle)
- **Rate limiting** (requests dropped by zone)

### Backend Instances

- **CPU usage** (user, system, idle)
- **Memory usage** (used, available, cached)
- **Disk I/O** (read/write bytes, operations)
- **Network traffic** (packets in/out, errors)
- **HTTP requests** (status codes, latency)

### Redis / Cache

- **Memory usage** (used, max, evicted keys)
- **Command counts** (get, set, del)
- **Key counts** by database
- **Expiration rate**
- **Client connections**

### PostgreSQL / Database

- **Active connections** (current vs max)
- **Query performance** (slow query count)
- **Replication lag** (bytes behind primary)
- **Transaction rates** (commits, rollbacks)
- **Cache hit ratio**
- **Index usage**

### System Metrics

- **Disk space** (used, available)
- **Load average** (1min, 5min, 15min)
- **File descriptor usage**
- **Process count**
- **Network errors** (receive, transmit)

## Alert Rules

### 🔴 Critical Alerts (page on-call)

- **All backends down** - No healthy instances available
- **nginx down** - Load balancer unreachable
- **PostgreSQL down** - Database unreachable
- **Cluster error rate >5%** - Service degradation

### 🟡 Warning Alerts (email/Slack)

- **Backend instance down** - One or more backend unavailable
- **High error rate** - Single backend >10% errors
- **High latency** - P95 response time >1s
- **Memory pressure** - <20% available
- **CPU spike** - >80% usage sustained
- **Redis down** - Cache layer unavailable
- **DB replication lag** - >5 seconds behind

### 🟢 Info Alerts

- **Rate limiting active** - Protecting from abuse
- **Disk space low** - <10% available

## Testing Monitoring

### Test 1: View Prometheus Targets

```bash
# Check all exporters are connected
curl http://localhost:9090/api/v1/targets

# Should show all targets as "up"
```

### Test 2: View Metrics

```bash
# Query Prometheus directly
curl 'http://localhost:9090/api/v1/query?query=up'

# Response shows each exporter status
```

### Test 3: Grafana Dashboard

```bash
# Open in browser
http://localhost:3000

# Should show:
# - 3 healthy backends
# - Request rate graph
# - Error rate near 0
# - CPU/Memory healthy
```

### Test 4: Trigger an Alert

```bash
# Stop a backend
docker stop boltlink-backend1

# Grafana should show:
# - Red alert for "Backend Instance Down"
# - Upstream health update
# - Error rate may spike

# Restart backend
docker start boltlink-backend1

# Alert clears automatically
```

### Test 5: Load Test & Monitor

```bash
# Generate traffic
ab -n 10000 -c 100 http://localhost/

# Watch Grafana:
# - Request rate increases
# - Latency p95 increases
# - Backend CPU/Memory spike
# - After load: all metrics return to normal
```

## Dashboards Included

### 1. Cluster Status Overview

- Healthy backend count
- Request rate (requests/sec)
- Error rate (5xx/sec)
- Rate limiting activity

### 2. Backend Performance

- Per-backend request rate
- Per-backend error rate
- CPU usage by instance
- Memory usage by instance
- Disk I/O by instance
- Network activity

### 3. nginx Load Balancer

- Upstream health (active/down)
- Connection counts
- Request latency (p50, p95, p99)
- Rate limiting by zone
- Cache hit rate

### 4. Database

- Active connections
- Query performance
- Replication lag
- Slow query count
- Cache efficiency

### 5. Cache (Redis)

- Memory usage
- Eviction rate
- Command count
- Hit rate
- Client connections

## Production Setup

### 1. Configure Persistent Storage

```yaml
# prometheus.yml - Add storage configuration
global:
  scrape_interval: 15s
  external_labels:
    cluster: 'production'

# Increase retention for production
storage:
  tsdb:
    retention:
      time: 30d # Keep 30 days of data
      size: '100GB' # Or size-based retention
```

### 2. High Availability Prometheus

```yaml
# Run multiple Prometheus instances
# Use Thanos for long-term storage:
# https://thanos.io/
```

### 3. Setup Alerts to Email/Slack

```yaml
# alertmanager.yml
route:
  group_by: ['alertname', 'cluster']
  receiver: 'team-email'
  repeat_interval: 4h

receivers:
  - name: 'team-email'
    email_configs:
      - to: 'ops@boltlink.com'
        from: 'alerts@boltlink.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@boltlink.com'
        auth_password: 'app-password'
```

### 4. Setup Slack Integration

```yaml
# alertmanager.yml
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'
        title: 'BoltLink Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

### 5. RBAC for Prometheus

```bash
# Use Keycloak/OAuth2 Proxy for authentication
docker run -d \
  --name oauth2-proxy \
  -p 4180:4180 \
  -e OAUTH2_PROXY_UPSTREAMS="http://prometheus:9090" \
  -e OAUTH2_PROXY_PROVIDER="keycloak" \
  -e OAUTH2_PROXY_CLIENT_ID="prometheus" \
  oauth2-proxy/oauth2-proxy
```

## Troubleshooting

### Issue: Prometheus shows targets as "DOWN"

```bash
# Check if exporters are running
curl http://localhost:4040/metrics         # nginx_exporter
curl http://localhost:9121/metrics         # redis_exporter
curl http://localhost:9187/metrics         # postgres_exporter
curl http://localhost:9100/metrics         # node_exporter

# Check firewall
sudo ufw allow 4040
sudo ufw allow 9121
sudo ufw allow 9187
sudo ufw allow 9100
```

### Issue: No data in Grafana

```bash
# Verify Prometheus is scraping
curl http://localhost:9090/api/v1/query?query=up

# Check Prometheus logs
tail -f /var/log/prometheus/prometheus.log

# Reload Prometheus config
killall -HUP prometheus
```

### Issue: Missing metrics

```bash
# Check metric names available
curl 'http://localhost:9090/api/v1/label/__name__/values'

# Query specific metric
curl 'http://localhost:9090/api/v1/query?query=nginx_requests_total'
```

## Performance Tuning

### 1. Adjust Scrape Intervals

```yaml
# Faster updates (higher load):
global:
  scrape_interval: 5s

# Slower updates (lower load):
global:
  scrape_interval: 30s
```

### 2. Reduce Alert Evaluation

```yaml
global:
  evaluation_interval: 60s # From 30s
```

### 3. Limit Metrics Cardinality

```yaml
# Drop high-cardinality labels
metric_relabel_configs:
  - source_labels: [__name__]
    regex: 'http_request_duration.*'
    action: keep
```

## Next Steps

✅ **Phase 1 Complete!**

- [x] Phase 1.1: Health endpoint
- [x] Phase 1.2: Load balancer
- [x] Phase 1.3: Rate limiting
- [x] Phase 1.4: Monitoring ✅

⏳ **Phase 2: Containerization**

- [ ] Phase 2.1: Create Dockerfile
- [ ] Phase 2.2: Create docker-compose.yml

## Quick Reference

| Component         | Port   | Dashboard              | Health          |
| ----------------- | ------ | ---------------------- | --------------- |
| nginx             | 80/443 | localhost/health       | HTTP 200        |
| Prometheus        | 9090   | localhost:9090         | /api/v1/targets |
| Grafana           | 3000   | localhost:3000         | Login page      |
| nginx_exporter    | 4040   | localhost:4040/metrics | HTTP 200        |
| redis_exporter    | 9121   | localhost:9121/metrics | HTTP 200        |
| postgres_exporter | 9187   | localhost:9187/metrics | HTTP 200        |
| node_exporter     | 9100   | localhost:9100/metrics | HTTP 200        |
