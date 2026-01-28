# Phase 1: Load Balancer Setup - NGINX Configuration Guide

## Overview

This phase sets up NGINX as a reverse proxy load balancer for BoltLink, enabling:

- ✅ Round-robin distribution across 3 backend instances
- ✅ Automatic failover (removes unhealthy servers)
- ✅ Connection pooling (reduced latency)
- ✅ Health check monitoring (every 2-5 seconds)
- ✅ Request forwarding with proper headers
- ✅ Gzip compression (bandwidth savings)
- ✅ SSL/TLS termination (when configured)
- ✅ **DDoS rate limiting (3-tier: general/strict/per-key)**
- ✅ **Sticky sessions for stateful connections**

## Architecture

```
┌─────────────────┐
│   Client Req    │
└────────┬────────┘
         │
    ┌────▼─────┐
    │   NGINX   │ ◄─── Load Balancer (Single Entry Point)
    └────┬─────┘
         │
    ┌────┴──────────┬────────────┬─────────────┐
    │               │            │             │
┌───▼──┐      ┌───▼──┐    ┌───▼──┐    ┌────────┐
│Bkend1│      │Bkend2│    │Bkend3│    │Dead?   │
│:5000 │      │:5000 │    │:5000 │    │Removed │
└──────┘      └──────┘    └──────┘    └────────┘
  ✅ Active    ✅ Active  ✅ Active     ❌ Out of pool
```

## Installation

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y nginx

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx  # Start on boot
```

### macOS

```bash
brew install nginx

# Start nginx
brew services start nginx
```

### Docker

Already included in docker-compose.yml (Phase 2)

## Configuration

### 1. Replace default nginx.conf

```bash
# Linux
sudo cp nginx.conf /etc/nginx/nginx.conf

# macOS
cp nginx.conf /opt/homebrew/etc/nginx/nginx.conf
```

### 2. Test configuration syntax

```bash
sudo nginx -t
# Output should be:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 3. Reload nginx (apply changes without downtime)

```bash
sudo systemctl reload nginx
# or
sudo nginx -s reload
```

## Configuration Explained

### Upstream Block (Load Balancing Strategy)

```nginx
upstream backend_servers {
    least_conn;  # ← LOAD BALANCING ALGORITHM

    server backend1.internal:5000 max_fails=3 fail_timeout=10s weight=1;
    server backend2.internal:5000 max_fails=3 fail_timeout=10s weight=1;
    server backend3.internal:5000 max_fails=3 fail_timeout=10s weight=1;
}
```

**Algorithm Options:**

- `least_conn` (CURRENT): Route to server with fewest active connections ⭐ Recommended for long connections
- `round_robin` (default): Cycle through servers equally
- `ip_hash`: Route same IP to same server (session persistence)
- `least_time` (NGINX+): Route to server with lowest latency + fewest connections

**Health Checking:**

- `max_fails=3`: Remove server after 3 consecutive failures
- `fail_timeout=10s`: Attempt recovery after 10 seconds
- Nginx automatically probes /health endpoint on each request

### Proxy Headers

```nginx
proxy_set_header X-Real-IP $remote_addr;        # Original client IP
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # Proxy chain
proxy_set_header X-Forwarded-Proto $scheme;     # HTTP/HTTPS
proxy_set_header X-Request-ID $request_id;      # For tracing
```

**Why important?** Backend receives client IP for analytics, logging, geolocation.

### Timeouts

```nginx
proxy_connect_timeout 10s;    # How long to wait for connection
proxy_send_timeout 30s;       # How long to wait for upload
proxy_read_timeout 30s;       # How long to wait for response
```

**Tuning:** Increase for large uploads, decrease for low-latency APIs.

### Connection Pooling

```nginx
proxy_http_version 1.1;
proxy_set_header Connection "";
```

Reuses TCP connections between nginx and backends (huge performance gain).

### Failover Logic

```nginx
proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
proxy_next_upstream_tries 2;
proxy_next_upstream_timeout 10s;
```

If backend returns error, automatically retry next server (up to 2 times within 10s).

## Rate Limiting & Sticky Sessions

### Rate Limiting Zones (3-Tier Protection)

nginx.conf now includes **3 rate limiting zones** to protect against DDoS and abuse:

```nginx
# Zone 1: General API (100 req/sec per IP)
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/s;

# Zone 2: Strict endpoints (10 req/sec per IP) - login, key generation
limit_req_zone $binary_remote_addr zone=strict_limit:10m rate=10r/s;

# Zone 3: Per-API-Key (1000 req/sec per key) - data endpoints
limit_req_zone $http_x_api_key zone=api_key_limit:10m rate=1000r/s;
```

**Applied to:**

- **Strict Zone** (10 req/sec): Login, register, key generation, settings
  - Prevents brute force attacks
  - Small burst allowance (20 requests)
  - Uses sticky sessions (same IP → same backend for consistency)
- **API Key Zone** (1000 req/sec): Analytics, links, campaigns, clicks
  - Per-key rate limiting (authenticated requests)
  - Large burst allowance (100 requests)
  - Enables power users while protecting shared infrastructure
- **General Zone** (100 req/sec): Everything else
  - Fallback protection
  - Medium burst allowance (200 requests)
  - Applied to all remaining routes

### Rate Limit Response Headers

Every response includes rate limit status:

```
X-RateLimit-Limit: 100              # Limit for this zone
X-RateLimit-Remaining: 95           # Requests remaining
X-RateLimit-Zone: general_limit     # Zone name
```

When exceeded, nginx returns **HTTP 429 (Too Many Requests)** with:

```json
{
  "error": "Too Many Requests",
  "retry_after": 1
}
```

### Sticky Sessions (Session Persistence)

For stateful operations (login, session management), nginx routes the same IP to the same backend:

```nginx
upstream backend_servers_sticky {
    ip_hash;  # Hash client IP to backend
    server backend1.internal:5000;
    server backend2.internal:5000;
    server backend3.internal:5000;
}

location ~ ^/(auth/login|auth/register|settings)$ {
    proxy_pass http://backend_servers_sticky;
}
```

**Benefits:**

- Session state stays on one backend (no session sync needed)
- Faster response (local cache hits)
- Prevents "logged in on backend1, logged out on backend2" issues
- Works even with in-memory sessions (Redis not required)

**Trade-offs:**

- Uneven load distribution if one user makes many requests
- If backend dies, user gets new connection to different backend (session lost)
- Doesn't work well for browser sessions (refresh may route to different IP)

### Burst Allowance Configuration

Each zone allows temporary traffic spikes via `burst` parameter:

```nginx
limit_req zone=strict_limit burst=20 nodelay;    # Allow 20 extra requests
limit_req zone=api_key_limit burst=100 nodelay;  # Allow 100 extra requests
limit_req zone=general_limit burst=200 nodelay;  # Allow 200 extra requests
```

**How it works:**

- Normal: 10 req/sec on strict_limit
- Burst: 20 additional requests accepted (even if >10/sec)
- After burst: Back to 10 req/sec limit
- Total time to recover from burst: ~2-3 seconds

**nodelay parameter:**

- Without: Queue requests, release gradually (introduces latency)
- With: Reject immediately when burst exceeded (better UX for clients)

## Testing

### Test 1: Basic Health Check

```bash
# Check if nginx is running
curl http://localhost/health

# Response should be:
```

# {"status":"healthy","timestamp":"...","uptime":123.45,"service":"boltlink-api","version":"1.0.0"}

````

### Test 2: Verify Load Balancing

```bash
# Make multiple requests, watch which backend handles each
for i in {1..10}; do curl http://localhost/; done

# Check access logs
tail -f /var/log/nginx/boltlink_access.log
````

### Test 3: Monitor Upstream Health

```bash
# Check nginx status page
curl http://localhost/nginx_status

# Shows:
# Active connections: 5
# ...
```

### Test 4: Test Rate Limiting - General Zone

```bash
# Make 105 requests rapidly to trigger rate limit
for i in {1..105}; do
    curl -s -w "Status: %{http_code}\n" http://localhost/
done

# First 100 succeed (100 req/sec limit)
# Remaining 5 hit burst allowance
# If you exceed burst (105+), get 429:
# HTTP 429 Too Many Requests

# Check response headers
curl -i http://localhost/
# Look for:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Zone: general_limit
```

### Test 5: Test Strict Zone - Login Endpoint

```bash
# Make 15 requests to strict endpoint
for i in {1..15}; do
    curl -s -w "Status: %{http_code}\n" http://localhost/auth/login \
         -H "Content-Type: application/json" \
         -d '{"email":"test@example.com","password":"test"}'
done

# First 10 succeed (strict 10 req/sec limit)
# Next 20 allowed by burst (burst=20)
# Request 31+ get 429

# Verify sticky session headers
curl -i http://localhost/auth/login | grep X-
# Check backend logs to confirm same backend handles requests
```

### Test 6: Test Per-Key Rate Limiting

```bash
# Make requests with API key
API_KEY="your-api-key-here"

for i in {1..1005}; do
    curl -s -w "Status: %{http_code}\n" http://localhost/api/analytics \
         -H "X-API-Key: $API_KEY"
done

# First 1000 succeed (1000 req/sec per-key limit)
# Next 100 allowed by burst (burst=100)
# Request 1101+ get 429

# Verify headers show api_key_limit zone
curl -i http://localhost/api/analytics -H "X-API-Key: $API_KEY" | grep X-RateLimit
```

### Test 7: Verify Session Persistence

```bash
# Make 3 requests to auth endpoint with same IP
for i in {1..3}; do
    curl -v http://localhost/auth/me \
         -H "X-API-Key: test-key" 2>&1 | grep "X-Upstream:"
done

# Output should show SAME backend for all 3:
# X-Upstream: backend1.internal:5000
# X-Upstream: backend1.internal:5000
# X-Upstream: backend1.internal:5000

# Compare with general endpoint (not sticky):
for i in {1..3}; do
    curl -v http://localhost/api/links 2>&1 | grep "X-Upstream:"
done

# Output should show MIX of backends:
# X-Upstream: backend1.internal:5000
# X-Upstream: backend2.internal:5000
# X-Upstream: backend3.internal:5000
```

### Test 8: Monitor Upstream Health

```bash
# Check nginx status page
curl http://localhost/nginx_status

# Shows:
# Active connections: 5
# ...
```

### Test 9: Simulate Backend Failure

```bash
# Stop backend1
docker stop boltlink-backend1

# Make requests (nginx should route to backend2 or 3)
curl http://localhost/

# After 3 failed attempts, nginx removes backend1 from pool
# After 10s (fail_timeout), nginx tries again
```

### Test 10: Monitor Rate Limiting in Logs

```bash
# See which zones are rejecting requests
grep "limiting requests" /var/log/nginx/boltlink_error.log

# Shows which IPs exceeded limits:
# [warn] ... client: 192.168.1.100, server: localhost, request: "GET / HTTP/1.1",
#            limiting requests, excess: 5.000, by zone "general_limit", client: 192.168.1.100

# Parse rate limit violations
grep "limiting requests" /var/log/nginx/boltlink_error.log | \
    awk '{print $NF}' | sort | uniq -c | sort -rn
```

### Test 11: Simulate Backend Failure

```bash
# Stop backend1
docker stop boltlink-backend1

# Make requests (nginx should route to backend2 or 3)
curl http://localhost/

# After 3 failed attempts, nginx removes backend1 from pool
# After 10s (fail_timeout), nginx tries again
```

### Test 5: Monitor Upstream Changes

```bash
# Watch nginx logs for upstream changes
grep "upstream" /var/log/nginx/boltlink_error.log

# Example output:
# [warn] ... upstream server disabled while connecting to upstream
```

## Production Configuration Changes

### 1. Enable HTTPS (SSL/TLS)

Replace this section in nginx.conf:

```nginx
server {
    listen 80;
```

With:

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

### 2. Adjust Backend Hostnames

In production, replace:

```nginx
server backend1.internal:5000
server backend2.internal:5000
server backend3.internal:5000
```

With actual IP addresses or hostnames:

```nginx
server 10.0.1.10:5000
server 10.0.1.11:5000
server 10.0.1.12:5000
```

### 3. Enable Rate Limiting (DDoS Protection)

Add to http block:

```nginx
limit_req_zone $binary_remote_addr zone=general:10m rate=100r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=50r/s;

location / {
    limit_req zone=general burst=200 nodelay;
    proxy_pass http://backend_servers;
}

location /api/ {
    limit_req zone=api burst=100 nodelay;
    proxy_pass http://backend_servers;
}
```

### 4. Enable Caching

Add to server block:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m
                 max_size=1g inactive=60m use_temp_path=off;

location ~ ^/api/(links|campaigns)/[a-zA-Z0-9]+$ {
    proxy_cache api_cache;
    proxy_cache_valid 200 1h;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503;
    proxy_pass http://backend_servers;

    add_header X-Cache-Status $upstream_cache_status;
}
```

## Monitoring

### 1. Check Running Status

```bash
sudo systemctl status nginx
sudo systemctl restart nginx
```

### 2. Monitor Upstream Health

```bash
# Real-time upstream status
watch -n 1 'curl -s http://localhost/nginx_status'
```

### 3. Parse Access Logs

```bash
# Requests per upstream server
grep "backend" /var/log/nginx/boltlink_access.log | awk '{print $NF}' | sort | uniq -c

# Failed requests
grep "502\|503\|504" /var/log/nginx/boltlink_access.log

# Response times
tail -100 /var/log/nginx/boltlink_access.log | awk '{print $NF}'
```

### 4. Prometheus Metrics (Advanced)

Install nginx_exporter:

```bash
docker run -p 4040:4040 \
  -e SCRAPE_URI=http://localhost/nginx_status \
  nginx/nginx-prometheus-exporter:latest
```

Then scrape from Prometheus:

```yaml
- job_name: 'nginx'
  static_configs:
    - targets: ['localhost:4040']
```

## Common Issues & Solutions

### Issue 1: "Connection refused" errors

**Problem:** Backends not running on :5000
**Solution:** Ensure all 3 backend instances are up

```bash
curl http://backend1:5000/health  # Should return 200
curl http://backend2:5000/health
curl http://backend3:5000/health
```

### Issue 2: All requests go to one server

**Problem:** `least_conn` algorithm misbehaving
**Solution:** Check if other backends are unhealthy

```bash
# View upstream status
curl http://localhost/nginx_status

# If all traffic on one server:
# - Check if other backends are returning 5xx errors
# - Verify network connectivity
# - Check backend logs
```

### Issue 3: High response times

**Problem:** Timeout or buffering issue
**Solution:** Increase buffer sizes and timeouts

```nginx
proxy_buffer_size 8k;       # Increase from 4k
proxy_buffers 16 8k;        # Increase from 8 4k
proxy_read_timeout 60s;     # Increase from 30s
```

### Issue 4: Memory or CPU spike

**Problem:** Too many worker processes
**Solution:** Reduce worker processes

```nginx
worker_processes 2;  # Reduce from auto
```

## Performance Tuning

### 1. Increase File Descriptors (Linux)

```bash
# Check current limit
ulimit -n

# Increase permanently
echo "worker_rlimit_nofile 65535;" >> /etc/nginx/nginx.conf
```

### 2. Tune TCP Stack (Linux)

```bash
sysctl -w net.core.somaxconn=65535
sysctl -w net.ipv4.tcp_max_syn_backlog=65535
sysctl -w net.ipv4.ip_local_port_range="1024 65535"
```

### 3. Increase Connection Pool

```nginx
keepalive_timeout 120;        # Increase from 65
client_body_timeout 60;       # Add
client_header_timeout 60;     # Add
send_timeout 60;              # Add
```

### 4. Compress Large Responses

```nginx
gzip_min_length 1024;  # Only compress >1KB responses
gzip_comp_level 5;     # 1=fast, 9=best compression (balance at 5-6)
```

## Next Steps

✅ **Phase 1.1 Complete:** Added `/health` endpoint to backend
✅ **Phase 1.2 Complete:** Created nginx.conf
⏳ **Phase 1.3 Next:** Docker Compose setup for local testing
⏳ **Phase 2:** Containerize backend (Dockerfile, docker-compose.yml)
⏳ **Phase 3:** Deploy to 3 instances

## Verification Checklist

- [ ] nginx installed (`nginx -v`)
- [ ] nginx.conf copied to correct location
- [ ] Configuration syntax valid (`nginx -t`)
- [ ] nginx running (`systemctl status nginx`)
- [ ] Can reach /health endpoint (`curl http://localhost/health`)
- [ ] Upstream servers responding (`grep upstream /var/log/nginx/error.log`)
- [ ] Logs creating properly (`ls -la /var/log/nginx/`)
- [ ] Status page accessible (`curl http://localhost/nginx_status`)
- [ ] Load balancing working (check access.log for multiple upstreams)
- [ ] Failover tested (stopped backend, verified routing to others)

## Architecture Decision Log

| Decision            | Choice                      | Why                                                     |
| ------------------- | --------------------------- | ------------------------------------------------------- |
| LB Type             | nginx                       | OSS, lightweight, proven for millions of RPS            |
| Balancing Algorithm | least_conn                  | Optimal for long connections (WebSockets, long polling) |
| Health Checks       | Via requests + fail_timeout | Distributed + adaptive                                  |
| Retry Strategy      | 2 tries/10s                 | Balances reliability vs latency                         |
| Compression         | gzip L6                     | 60-70% bandwidth savings                                |
| SSL                 | Optional (Phase 2)          | Must happen before production                           |
| Caching             | Layer (not here)            | Application cache handles (Redis)                       |
| Rate Limiting       | Phase 1.4                   | Added after basic load balancing                        |
