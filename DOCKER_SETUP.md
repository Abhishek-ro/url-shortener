# Phase 2: Containerization Guide

## Overview

BoltLink is now fully containerized with:

- **3 Backend instances** running in separate containers
- **nginx load balancer** routing between backends
- **PostgreSQL database** with persistent volumes
- **Redis cache** with persistence
- **Complete monitoring stack** (Prometheus, Grafana, exporters)
- **All services** auto-restart on failure

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                       │
│                    (172.20.0.0/16)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │             nginx Load Balancer (port 80)               │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │                                    │
│        ┌───────────────────┼───────────────────┐                │
│        │                   │                   │                │
│   ┌────▼───┐          ┌────▼───┐         ┌────▼───┐            │
│   │Backend1│          │Backend2│         │Backend3│            │
│   │:5000   │          │:5000   │         │:5000   │            │
│   └────┬───┘          └────┬───┘         └────┬───┘            │
│        │                   │                   │                │
│        └───────────────────┼───────────────────┘                │
│                            │                                    │
│        ┌───────────────────┼───────────────────┐                │
│        │                   │                   │                │
│   ┌────▼──────┐      ┌─────▼──────┐      ┌────▼────┐           │
│   │PostgreSQL │      │   Redis    │      │Monitoring
│   │:5432      │      │   :6379    │      │Stack    │           │
│   └───────────┘      └────────────┘      └─────────┘           │
│                                                                 │
│  Monitoring Stack:                                              │
│  ├── Prometheus (:9090)     - Metrics collection              │
│  ├── Grafana (:3000)        - Dashboards & alerts             │
│  ├── nginx-exporter (:4040) - Load balancer metrics           │
│  ├── redis-exporter (:9121) - Cache metrics                   │
│  ├── postgres-exporter (:9187) - Database metrics             │
│  └── node-exporter (:9100)  - System metrics                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Docker**: 20.10+ ([Install](https://docs.docker.com/get-docker/))
- **Docker Compose**: 2.0+ (included with Docker Desktop)
- **4GB RAM** minimum (8GB+ recommended)
- **20GB disk space** for images and volumes

### Check Installation

```bash
docker --version          # Docker 20.10+
docker-compose --version  # Docker Compose 2.0+
docker run hello-world    # Verify Docker works
```

## Quick Start

### 1. Build Docker Image

```bash
cd /path/to/boltlink-platform

# Build backend image
docker-compose build backend1

# Or build all services
docker-compose build
```

### 2. Start All Services

```bash
# Start in foreground (see logs)
docker-compose up

# Or start in background
docker-compose up -d

# Check service status
docker-compose ps
```

### 3. Verify Services Are Healthy

```bash
# Check all containers
docker-compose ps

# Output should show all services "Up":
# NAME                 STATUS
# boltlink-nginx       Up (healthy)
# boltlink-backend1    Up (healthy)
# boltlink-backend2    Up (healthy)
# boltlink-backend3    Up (healthy)
# boltlink-postgres    Up (healthy)
# boltlink-redis       Up (healthy)
# boltlink-prometheus  Up (healthy)
# boltlink-grafana     Up (healthy)
```

### 4. Access Services

| Service          | URL                   | Purpose                  |
| ---------------- | --------------------- | ------------------------ |
| **BoltLink API** | http://localhost      | Main API (load balanced) |
| **Grafana**      | http://localhost:3000 | Dashboards (admin/admin) |
| **Prometheus**   | http://localhost:9090 | Metrics database         |
| **PostgreSQL**   | localhost:5432        | Database                 |
| **Redis**        | localhost:6379        | Cache                    |

## Building the Docker Image

### What's Included in [backend/Dockerfile](backend/Dockerfile)

```dockerfile
# Stage 1: Builder
- Install build tools
- Compile TypeScript → JavaScript
- Generate Prisma Client
- Install production dependencies

# Stage 2: Runtime
- Minimal Alpine Linux image
- Only production dependencies
- Non-root user (security)
- Health checks enabled
- Proper signal handling
```

### Build Strategies

**1. Build from Source (recommended for development)**

```bash
docker-compose build
```

**2. Build Specific Service**

```bash
docker-compose build backend1
```

**3. Build Without Cache**

```bash
docker-compose build --no-cache
```

**4. Build and Push to Registry**

```bash
# Tag image
docker tag boltlink-backend:latest myregistry.azurecr.io/boltlink-backend:1.0

# Push to registry
docker push myregistry.azurecr.io/boltlink-backend:1.0
```

## Dockerfile Details

### Multi-Stage Build Advantages

```dockerfile
FROM node:18-alpine AS builder      # Stage 1: 1.2GB (includes build tools)
... build and compile ...
COPY --from=builder /build/dist     # Stage 2: 300MB final image (prod deps only)
```

**Benefits:**

- **50% smaller image** (no build tools in final image)
- **Faster deployments** (less to download)
- **Improved security** (no compiler/build tools exposed)

### Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', ...)"
```

**What it does:**

- Checks `/health` endpoint every 30 seconds
- Waits 40 seconds before first check (app startup)
- Removes container if 3 checks fail
- Docker/Kubernetes can auto-restart unhealthy containers

## docker-compose.yml Configuration

### Services Defined

| Service    | Image              | Purpose            | Port                   |
| ---------- | ------------------ | ------------------ | ---------------------- |
| nginx      | nginx:alpine       | Load balancer      | 80/443                 |
| backend1-3 | custom:Dockerfile  | API servers        | 5000                   |
| postgres   | postgres:15-alpine | Database           | 5432                   |
| redis      | redis:7-alpine     | Cache              | 6379                   |
| prometheus | prom/prometheus    | Metrics DB         | 9090                   |
| grafana    | grafana/grafana    | Dashboards         | 3000                   |
| exporters  | prometheus/\*      | Metrics collection | 4040, 9121, 9187, 9100 |

### Environment Variables

```yaml
backend:
  environment:
    - NODE_ENV=development # Change to 'production'
    - PORT=5000 # API port
    - DATABASE_URL=postgresql://... # Postgres connection
    - REDIS_URL=redis://redis:6379 # Redis connection
    - LOG_LEVEL=info # Logging verbosity
    - INSTANCE_ID=backend-1 # For monitoring
```

### Networks

```yaml
networks:
  boltlink-network:
    driver: bridge
    ipam:
      subnet: 172.20.0.0/16
```

**Why custom network?**

- Service discovery by name (nginx connects to `postgres`, not IP)
- Isolated from other containers
- Static IPs for debugging
- Better performance than bridge

### Volumes

```yaml
volumes:
  postgres_data: # Database persistence
  redis_data: # Cache persistence
  prometheus_data: # Metrics storage
  grafana_data: # Dashboard configs
```

**Why?**

- Data survives container restart
- Shared between rebuilds
- Can be backed up/restored

### Health Checks

Each service has `healthcheck` configuration:

```yaml
healthcheck:
  test: ['CMD', 'wget', '--tries=1', '--spider', 'http://localhost:5000/health']
  interval: 10s
  timeout: 5s
  retries: 3
  start_period: 15s
```

**Result:**

- Docker shows `(healthy)` or `(unhealthy)` in `docker-compose ps`
- Container auto-restarts if unhealthy
- Dependent services wait for health

## Running & Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend1

# Last 100 lines
docker-compose logs -n 100 nginx

# Follow errors only
docker-compose logs -f | grep ERROR
```

### Execute Commands in Container

```bash
# Run bash in backend1
docker-compose exec backend1 sh

# Run psql in postgres
docker-compose exec postgres psql -U postgres boltlink

# Check Redis
docker-compose exec redis redis-cli ping
```

### Database Management

```bash
# View database
docker-compose exec postgres psql -U postgres -d boltlink

# Backup database
docker-compose exec postgres pg_dump -U postgres boltlink > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres boltlink < backup.sql

# Run migrations
docker-compose exec backend1 npm run migrate
```

### Stop & Clean Up

```bash
# Stop services (keep volumes)
docker-compose stop

# Stop and remove containers (keep volumes)
docker-compose down

# Remove everything including volumes (CAREFUL!)
docker-compose down -v

# Remove unused images
docker system prune -a
```

## Performance Tuning

### 1. Limit Container Resources

```yaml
backend1:
  deploy:
    resources:
      limits:
        cpus: '1' # Max 1 CPU
        memory: 512M # Max 512MB RAM
      reservations:
        cpus: '0.5' # Guaranteed 0.5 CPU
        memory: 256M # Guaranteed 256MB RAM
```

### 2. Increase Log Rotation

```yaml
logging:
  driver: 'json-file'
  options:
    max-size: '10m' # Rotate when 10MB
    max-file: '3' # Keep 3 files
```

### 3. Optimize Build Cache

```bash
# Use .dockerignore to reduce context
# Good ordering: frequently changing files last
# Layer dependencies before application code
```

### 4. Network Optimization

```yaml
# Use custom bridge network (already in compose)
# Reduce cross-container communication
# Use connection pooling in app
```

## Production Deployment

### 1. Prepare Production Config

```yaml
backend:
  environment:
    - NODE_ENV=production
    - LOG_LEVEL=warn
    - DATABASE_POOL_SIZE=20 # Increase for production
    - REDIS_CLUSTER=true # Use Redis Cluster
    - PROMETHEUS_PUSH_GATEWAY=http://prometheus-pushgateway:9091
```

### 2. Production docker-compose.yml

```bash
# Use separate file for production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Registry & Push

```bash
# Build and tag
docker build -t myregistry.azurecr.io/boltlink:latest .

# Push to registry
docker push myregistry.azurecr.io/boltlink:latest

# Pull in production
docker pull myregistry.azurecr.io/boltlink:latest
```

### 4. Orchestration (Kubernetes)

For large scale, use Kubernetes:

```bash
# Convert docker-compose to Kubernetes manifests
kompose convert -f docker-compose.yml -o k8s/

# Deploy
kubectl apply -f k8s/
```

## Troubleshooting

### Issue: Container exits immediately

```bash
# Check logs
docker-compose logs backend1

# Rebuild with fresh cache
docker-compose build --no-cache backend1
docker-compose up backend1
```

### Issue: Connection refused between containers

```bash
# Verify network
docker network ls
docker network inspect boltlink-platform_boltlink-network

# Test DNS
docker-compose exec backend1 nslookup postgres

# Test connectivity
docker-compose exec backend1 nc -zv postgres 5432
```

### Issue: Out of disk space

```bash
# Check disk usage
docker system df

# Prune unused resources
docker system prune -a --volumes

# Remove old images
docker rmi $(docker images -q)
```

### Issue: High memory usage

```bash
# View memory by container
docker stats

# Limit container memory in compose
docker-compose up --memory 512m backend1
```

### Issue: Prometheus not scraping targets

```bash
# Check Prometheus config
docker-compose exec prometheus prometheus --config.file=/etc/prometheus/prometheus.yml --web.enable-admin-api

# Query targets
curl http://localhost:9090/api/v1/targets

# View Prometheus logs
docker-compose logs prometheus
```

## Testing the Stack

### Test 1: Health Checks

```bash
# Check all endpoints
for i in {1..10}; do
  echo "=== Request $i ==="
  curl -s http://localhost/health | jq .
  sleep 1
done
```

### Test 2: Load Balancing

```bash
# Track which backend handles requests
for i in {1..10}; do
  curl -s -H "X-Debug: true" http://localhost/ 2>&1 | grep backend
done
```

### Test 3: Failover

```bash
# Stop backend1
docker-compose stop backend1

# Make requests (should route to backend2/3)
for i in {1..5}; do
  curl -v http://localhost/ 2>&1 | grep X-Upstream
done

# Restart backend1
docker-compose up -d backend1
```

### Test 4: Monitoring

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[0:3]'

# Query metrics
curl 'http://localhost:9090/api/v1/query?query=up'

# Access Grafana
# http://localhost:3000 → Login (admin/admin)
```

### Test 5: Database Persistence

```bash
# Stop and remove containers
docker-compose down

# Verify data persists
docker volume inspect boltlink-platform_postgres_data
docker volume inspect boltlink-platform_redis_data

# Restart
docker-compose up -d

# Data should be intact
docker-compose exec postgres psql -U postgres -d boltlink -c "SELECT COUNT(*) FROM links;"
```

## Next Steps

✅ **Phase 1 Complete** - Infrastructure planning & monitoring
✅ **Phase 2 Complete** - Containerization

⏳ **Phase 3: Deploy 3 Backend Instances**

- Provision 3 servers/VMs
- Push Docker images to registry
- Deploy containers on each server
- Verify health checks and load balancing
- Test end-to-end failover

📋 **Later Phases:**

- Phase 4: Redis Cluster setup
- Phase 5: PostgreSQL Replication
- Phase 6: Automated Failover (Patroni + Sentinel)
- Phase 7: Load testing & chaos engineering
- Phase 8: Production documentation

## Quick Reference

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Clean up (remove volumes too)
docker-compose down -v

# Rebuild images
docker-compose build

# Execute command
docker-compose exec backend1 sh
```
