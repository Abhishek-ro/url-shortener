# Docker Build Fix - Backend Deployment

## The Problem

The Docker build was failing with:

```
ERROR: failed to calculate checksum of ref v7fgwwdh7i3ybd0b961ne6oya::z96x48efo161t3ax1qn1lboe8: "/backend/src": not found
```

## Root Cause

The `backend/Dockerfile` was using `COPY backend/src` which assumes the build context includes the `backend/` directory prefix. However, Docker was being run from the root directory, so it couldn't find those paths.

## The Fix

**Option 1: Update Docker Build Command (RECOMMENDED)**

Build from the root directory with correct context:

```bash
# Build backend
docker build -f backend/Dockerfile -t boltlink-backend:latest .

# Build frontend
docker build -f frontend/Dockerfile -t boltlink-frontend:latest .

# Or use docker-compose (includes build context)
docker-compose build
```

**Option 2: Updated Dockerfile Paths**

The `backend/Dockerfile` has been updated to use relative paths from the backend directory context:

```dockerfile
# OLD (broken when building from root)
COPY backend/src ./src

# NEW (works when building from root)
COPY src ./src
```

## Correct Deployment Commands

### Using Docker CLI

```bash
# From project root
docker build -f backend/Dockerfile -t boltlink-backend:latest .
docker build -f frontend/Dockerfile -t boltlink-frontend:latest .

# Run backend
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e FRONTEND_URL="http://localhost:3000" \
  boltlink-backend:latest

# Run frontend
docker run -p 3000:3000 boltlink-frontend:latest
```

### Using Docker Compose

```bash
# From project root
docker-compose build
docker-compose up
```

### Using Render.com/Railway/Heroku

Update build command to:

```bash
docker build -f backend/Dockerfile -t app:latest .
```

Or in `render.yaml`:

```yaml
services:
  - type: web
    name: boltlink-backend
    buildCommand: 'docker build -f backend/Dockerfile -t app:latest .'
    dockerfilePath: backend/Dockerfile
```

## Key Points

✅ Always build from **project root** (where `.git` and `docker-compose.yml` are)
✅ Specify the correct `-f` flag pointing to the Dockerfile
✅ Use `.` (current directory) as build context
✅ Environment variables can be passed with `-e` flag or in docker-compose
✅ Don't hardcode paths in COPY commands - use relative paths

## Environment Variables for Docker

Pass these when running:

```bash
docker run \
  -e PORT=5000 \
  -e FRONTEND_URL=http://localhost:3000 \
  -e ALLOWED_ORIGINS=http://localhost:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL=redis://redis:6379 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret-key \
  boltlink-backend:latest
```

## Verify the Fix

```bash
# Check if image builds successfully
docker build -f backend/Dockerfile -t boltlink-backend:test . --no-cache

# If successful, you'll see:
# => => naming to docker.io/library/boltlink-backend:test

# Clean up
docker rmi boltlink-backend:test
```
