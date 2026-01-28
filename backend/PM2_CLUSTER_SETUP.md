# PM2 Cluster Mode Setup - Multi-Core Scaling

## Overview

PM2 cluster mode automatically spawns worker processes for **each available CPU core**, enabling true horizontal scaling within a single machine. This maximizes CPU utilization and prevents bottlenecks.

### Why PM2 Cluster Mode?

- **Multi-core utilization**: Automatically uses all CPU cores
- **Load balancing**: PM2 distributes requests across worker processes
- **Zero-downtime reloads**: Graceful restart of workers one-by-one
- **Automatic restart**: Crashed workers are instantly respawned
- **Memory limits**: Restart workers if memory exceeds threshold
- **Monitoring**: Built-in metrics and logging

### Architecture

```
┌─────────────────────────────────────────────────┐
│         PM2 Master Process (main)               │
├─────────────────────────────────────────────────┤
│  Load Balancer (distributes traffic)            │
├─────────────────────────────────────────────────┤
│ Worker 1 │ Worker 2 │ Worker 3 │ Worker 4 │... │  (CPU cores)
│ [PID: x] │ [PID: y] │ [PID: z] │ [PID: w] │    │
└─────────────────────────────────────────────────┘
     ↓          ↓          ↓          ↓
   Redis (shared state), Postgres (shared DB)
```

---

## Quick Start

### 1. Build the project

```bash
cd backend
npm run build
```

### 2. Start PM2 cluster

**On Linux/Mac:**

```bash
bash pm2-setup.sh
```

**On Windows:**

```cmd
pm2-setup.bat
```

**Or manually:**

```bash
npm install pm2 --save-dev
npm run start:cluster
```

### 3. Verify cluster is running

```bash
npm run monit          # Real-time monitoring
npm run logs           # View logs
npx pm2 status         # Show worker status
```

### 4. View how many workers started

```bash
$ npx pm2 status

┌─────────────────────┬──────┬─────────┐
│ App name            │ id   │ status  │
├─────────────────────┼──────┼─────────┤
│ boltlink-api        │ 0    │ online  │
│ boltlink-api        │ 1    │ online  │
│ boltlink-api        │ 2    │ online  │
│ boltlink-api        │ 3    │ online  │  ← CPU cores
│ boltlink-aggregator │ 4    │ online  │
│ boltlink-worker     │ 5    │ online  │
└─────────────────────┴──────┴─────────┘
```

If you have **4 CPU cores**, you'll see 4 `boltlink-api` workers (IDs 0-3).

---

## Configuration Breakdown

### `ecosystem.config.js` Settings

#### API Service (Cluster Mode)

```javascript
{
  name: 'boltlink-api',
  script: './dist/index.js',
  instances: 'max',           // ← Uses all CPU cores
  exec_mode: 'cluster',       // ← Cluster mode (not fork)
  max_memory_restart: '500M', // ← Restart if memory > 500MB
  kill_timeout: 5000,         // ← Graceful shutdown timeout (5s)
  listen_timeout: 3000,       // ← Time to wait for app to bind port
  interpreter_args: '--max_old_space_size=1024', // ← Heap size
}
```

#### Worker Services (Fork Mode - Single Instance)

```javascript
{
  name: 'boltlink-aggregator',
  script: './dist/worker/aggregator.worker.js',
  instances: 1,        // ← Only 1 instance
  exec_mode: 'fork',   // ← Fork mode (not cluster)
  max_memory_restart: '300M',
}
```

**Why separate modes?**

- **API**: Cluster mode enables multi-core scaling and load balancing
- **Worker/Aggregator**: Fork mode (single instance) prevents race conditions and duplicate processing

---

## Essential Commands

### Monitoring

```bash
npm run monit          # Real-time CPU, memory, PID, etc.
npm run logs           # Tail logs from all processes
npx pm2 describe 0     # Deep dive into worker 0
npx pm2 show 0         # Show detailed stats for worker 0
```

### Process Management

```bash
npm run restart:cluster     # Graceful restart all workers
npm run stop:cluster        # Stop all workers
npx pm2 delete all          # Delete all processes
npx pm2 restart 0           # Restart only worker 0
```

### Logs

```bash
npx pm2 logs boltlink-api          # Logs for API workers
npx pm2 logs boltlink-api --lines 50 # Last 50 lines
npx pm2 flush                      # Clear all logs
```

### Environment

```bash
# Start with specific environment
NODE_ENV=production npm run start:prod

# Check current config
npx pm2 show boltlink-api
```

---

## Production Deployment

### 1. Enable Auto-Start on System Reboot

```bash
# Linux/Mac: Create systemd service that resurrects PM2 on boot
npx pm2 startup

# Windows: Create Windows service (requires admin)
npx pm2-windows-startup install

# Save current process list
npx pm2 save
```

### 2. Set Environment Variables

Create a `.env.production` file:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/boltlink
REDIS_URL=redis://prod-redis:6379
ALLOWED_ORIGINS=https://app.example.com,https://api.example.com
LOG_LEVEL=info
PORT=5000
```

Then start with:

```bash
NODE_ENV=production npm run start:prod
```

### 3. Health Checks

PM2 monitors process health. If a worker crashes:

- **Instant restart**: New worker spins up in < 1s
- **Memory leak detection**: `max_memory_restart` stops memory bloat
- **Logging**: All crashes logged to `logs/error.log`

### 4. Load Balancer Integration

When using PM2 cluster + load balancer (NGINX/HAProxy):

```nginx
# NGINX config
upstream boltlink_backend {
  least_conn;  # Least connections load balancing
  server 127.0.0.1:5000;
  server 127.0.0.1:5001;  # If manually bound to different ports
  server 127.0.0.1:5002;
}

server {
  location / {
    proxy_pass http://boltlink_backend;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

**Note:** PM2 cluster mode handles load balancing internally on a single machine. For multi-machine scaling, use containers (Docker/Kubernetes) instead.

---

## Performance Tuning

### 1. Heap Size per Worker

Adjust based on available memory:

```javascript
// For 8 GB RAM with 4 cores: 1.5GB per worker
interpreter_args: '--max_old_space_size=1536';

// For 16 GB RAM with 8 cores: 1.5GB per worker
interpreter_args: '--max_old_space_size=1536';
```

### 2. Memory Restart Threshold

Balance between stability and availability:

```javascript
max_memory_restart: '500M'; // Restart if > 500MB (strict)
max_memory_restart: '1G'; // Restart if > 1GB (relaxed)
```

### 3. Kill Timeout

Time allowed for graceful shutdown:

```javascript
kill_timeout: 5000; // 5 seconds
kill_timeout: 10000; // 10 seconds (safer for long requests)
```

### 4. Watch Mode (Development Only)

```javascript
// DEV: Auto-restart on file changes
watch: true,
ignore_watch: ['node_modules', 'dist', '.git'],

// PROD: Disable watch (no performance impact)
watch: false,
```

---

## Scaling Comparison

### Single Core (No Cluster)

```bash
$ npm start
→ Single Node process
→ Can only use 1 CPU core (~25% on 4-core machine)
→ Performance ceiling ~1000 req/s
```

### PM2 Cluster (4 Cores)

```bash
$ npm run start:cluster
→ 4 Node processes (one per core)
→ Uses all 4 CPU cores (~100%)
→ Performance ceiling ~4000 req/s (4× improvement)
```

### Kubernetes (Multi-Machine)

```bash
$ kubectl apply -f deployment.yaml
→ Multiple pods across multiple machines
→ Scales to 100+ cores
→ Performance ceiling limited by DB/Redis
```

---

## Monitoring Dashboard

Use PM2+ for real-time monitoring (optional):

```bash
npx pm2 web          # Opens http://localhost:9615 (basic dashboard)
npx pm2 plus         # Premium monitoring (web UI, alerts, etc.)
```

Or integrate with external tools:

- **Prometheus**: Export metrics from PM2 via `pm2-prometheus`
- **Datadog**: PM2 Datadog integration
- **New Relic**: Node.js APM with PM2 support

---

## Troubleshooting

### Workers keep restarting

```bash
# Check error logs
npm run logs

# Increase kill_timeout if graceful shutdown is failing
kill_timeout: 10000
```

### High memory usage

```bash
# Lower heap size or restart threshold
interpreter_args: '--max_old_space_size=512'
max_memory_restart: '300M'

# Check for memory leaks
npx pm2 monit
```

### Port already in use

```bash
# If starting multiple instances on same port (via load balancer)
# PM2 binds all workers to same port and load balances internally
# No additional port allocation needed

# To verify:
netstat -tulpn | grep 5000
```

### Zero-downtime restart not working

```bash
# Ensure app properly handles SIGTERM
# See graceful shutdown in backend/src/index.ts
# Verify wait_ready and listen_timeout settings
```

---

## Summary

| Feature               | Benefit                                |
| --------------------- | -------------------------------------- |
| **Cluster mode**      | Automatic multi-core utilization       |
| **Load balancing**    | Requests distributed across workers    |
| **Auto-restart**      | Crashed workers respawned instantly    |
| **Memory limits**     | Prevent memory bloat with auto-restart |
| **Graceful shutdown** | Zero-downtime reloads                  |
| **Monitoring**        | Real-time metrics and logging          |
| **Logging**           | Separate logs for each worker/service  |

---

## Next Steps

1. **Build the project**: `npm run build`
2. **Start cluster**: `npm run start:cluster`
3. **Monitor**: `npm run monit` (view all 4 workers + aggregator + worker)
4. **Test load**: Run k6 test and verify requests distribute across workers
5. **Production**: Configure auto-startup and deploy with `NODE_ENV=production`

---

## Reference

- **PM2 Docs**: https://pm2.keymetrics.io/docs/usage/cluster-mode/
- **Cluster Mode Guide**: https://pm2.keymetrics.io/docs/usage/cluster-mode/
- **Health Checks**: https://pm2.keymetrics.io/docs/usage/startup/
