# PM2 Cluster Mode - Quick Start Guide

## 🚀 Start PM2 Cluster (Multi-Core Scaling)

### Prerequisites

- Node.js 18+
- Backend built: `npm run build`
- Environment variables configured (`.env.production`)

### Option 1: Automated Setup (Recommended)

**Windows:**

```cmd
cd backend
pm2-setup.bat
```

**Linux/Mac:**

```bash
cd backend
bash pm2-setup.sh
```

This will:

1. Create `logs/` directory
2. Build TypeScript
3. Install PM2
4. Start cluster with all CPU cores
5. Display worker status

### Option 2: Manual Start

```bash
cd backend

# Build
npm run build

# Install PM2
npm install pm2 --save-dev

# Start cluster (uses all CPU cores)
npm run start:cluster

# Or with environment variables
NODE_ENV=production npm run start:prod
```

---

## 📊 Monitor Cluster

### Real-time Dashboard

```bash
npm run monit
```

Output (4-core machine):

```
┌─────────────────────────────────────────────────────────────┐
│ name              cpu  memory     PID  status     restart   │
├─────────────────────────────────────────────────────────────┤
│ boltlink-api      15%  120 MB  12345  online         0       │
│ boltlink-api      12%  118 MB  12346  online         0       │
│ boltlink-api      18%  125 MB  12347  online         0       │  ← 4 workers
│ boltlink-api      10%  115 MB  12348  online         0       │
│ boltlink-aggreg   2%    45 MB  12349  online         0       │
│ boltlink-worker   3%    50 MB  12350  online         0       │
└─────────────────────────────────────────────────────────────┘
```

### Process Status

```bash
npx pm2 status
```

### View Logs

```bash
npm run logs              # Tail all logs in real-time
npx pm2 logs boltlink-api   # Just API workers
npx pm2 logs boltlink-api --lines 100  # Last 100 lines
```

---

## 🔄 Manage Cluster

### Restart All Workers (Zero-Downtime)

```bash
npm run restart:cluster
```

PM2 gracefully restarts workers one-by-one without dropping connections.

### Stop Cluster

```bash
npm run stop:cluster
```

### Delete All Processes

```bash
npx pm2 delete all
```

### Restart Specific Worker

```bash
npx pm2 restart 0  # Restart worker 0
```

---

## 🎯 Key Features

| Feature                  | Command                   |
| ------------------------ | ------------------------- |
| **Monitor**              | `npm run monit`           |
| **View logs**            | `npm run logs`            |
| **Restart all**          | `npm run restart:cluster` |
| **Stop all**             | `npm run stop:cluster`    |
| **Show status**          | `npx pm2 status`          |
| **Deep dive (worker 0)** | `npx pm2 describe 0`      |

---

## 🔍 Verify Multi-Core Usage

### Check Number of Workers

```bash
npx pm2 status | grep boltlink-api | wc -l
# Output: 4 (on 4-core machine)
```

### Monitor CPU Load

```bash
npm run monit
# Each worker should show 5-20% CPU during load
```

### Run Load Test

```bash
# In separate terminal, run k6 test
cd k6
k6 run stress_test.js

# Watch workers handle load in monit
npm run monit
```

---

## 🌍 Production Deployment

### Enable Auto-Start on Reboot

**Linux/Mac:**

```bash
npx pm2 startup
npx pm2 save
```

**Windows (Admin Required):**

```cmd
npx pm2-windows-startup install
npx pm2 save
```

### Docker Deployment

```bash
# Build image with PM2 cluster mode
docker build -t boltlink-backend:latest .

# Run with 4 CPU cores allocated
docker run -d \
  --cpus="4" \
  --memory="2g" \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -p 5000:5000 \
  boltlink-backend:latest
```

---

## ⚙️ Performance Configuration

### Adjust Heap Size (in `ecosystem.config.js`)

```javascript
// For 8GB RAM with 4 cores: 1.5GB per worker
interpreter_args: '--max_old_space_size=1536';

// For 16GB RAM with 8 cores: 1.5GB per worker
interpreter_args: '--max_old_space_size=1536';
```

### Set Memory Restart Threshold

```javascript
// Restart worker if memory > 500MB
max_memory_restart: '500M';

// Restart worker if memory > 1GB
max_memory_restart: '1G';
```

---

## 📝 Logs Location

- **API logs**: `logs/out.log`
- **API errors**: `logs/error.log`
- **Aggregator logs**: `logs/aggregator-out.log`
- **Worker logs**: `logs/worker-out.log`

```bash
# View all logs
tail -f logs/*.log

# Clear all logs
npx pm2 flush
```

---

## 🐛 Troubleshooting

### Workers keep restarting

```bash
# Check error logs
npm run logs

# Increase graceful shutdown time
kill_timeout: 10000  # in ecosystem.config.js
```

### High memory usage

```bash
# Check which worker is using memory
npm run monit

# Restart that specific worker
npx pm2 restart <id>
```

### Port already in use

```bash
# PM2 cluster handles port internally
# If still getting error, check port 5000 is free
lsof -i :5000
```

---

## 📚 More Info

- [Full PM2 Setup Guide](./PM2_CLUSTER_SETUP.md)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Cluster Mode Details](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
