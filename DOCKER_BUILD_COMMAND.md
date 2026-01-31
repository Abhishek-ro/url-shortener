# 🐳 Docker Build Command - Quick Reference

## ✅ CORRECT: Build from Project Root

```bash
# From: c:\Users\Lenovo\OneDrive\Desktop\boltlink-platform

cd boltlink-platform

# Build backend
docker build -f backend/Dockerfile -t boltlink-backend:latest .

# Build frontend
docker build -f frontend/Dockerfile -t boltlink-frontend:latest .

# Or with docker-compose
docker-compose build
```

## ❌ WRONG: Don't Do This

```bash
# DON'T build from backend directory
cd backend
docker build .  # ❌ WRONG - missing -f flag and context

# DON'T use backend/ prefix in build path
docker build backend/Dockerfile  # ❌ WRONG

# DON'T copy with backend/ prefix
docker build -f backend/Dockerfile backend/  # ❌ WRONG context
```

## 🚀 For Render.com / Railway.app / Vercel

### Render.com

Update `render.yaml`:

```yaml
services:
  - type: web
    name: boltlink-backend
    env: docker
    dockerfilePath: backend/Dockerfile
    # Render automatically sets build context to project root
```

Or use environment variable to specify build command:

```
docker build -f backend/Dockerfile -t app:latest .
```

### Railway.app

Railway automatically detects Dockerfile. Make sure:

- Root Dockerfile exists OR
- Set `railwayignore` correctly OR
- Specify build command in settings

**Build Command:**

```
docker build -f backend/Dockerfile -t myapp:latest .
```

### Vercel (Frontend Only)

Vercel has built-in support for Next.js. For custom build:

```
npm run build
```

Or use docker:

```
docker build -f frontend/Dockerfile -t app:latest .
```

## 📋 Docker Compose Example

```yaml
version: '3.9'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - '5000:5000'
    environment:
      - PORT=5000
      - FRONTEND_URL=http://localhost:3000
      - ALLOWED_ORIGINS=http://localhost:3000
      - DATABASE_URL=postgresql://...
      - NODE_ENV=development

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - '3000:3000'
    depends_on:
      - backend
```

**Run:**

```bash
docker-compose build
docker-compose up
```

## 🔍 Troubleshooting

If you still get `not found` error:

1. **Check build command includes root context:**

   ```bash
   # Correct
   docker build -f backend/Dockerfile -t app:latest .

   # Wrong - missing period at end
   docker build -f backend/Dockerfile -t app:latest
   ```

2. **Verify you're in the right directory:**

   ```bash
   pwd  # Should output: .../boltlink-platform
   ls   # Should show: backend, frontend, docker-compose.yml, etc.
   ```

3. **Check Dockerfile paths are relative (no backend/ prefix):**

   ```dockerfile
   # Correct
   COPY package.json ./
   COPY src ./src

   # Wrong
   COPY backend/package.json ./
   ```

4. **Rebuild with no cache:**
   ```bash
   docker build -f backend/Dockerfile --no-cache -t boltlink-backend:latest .
   ```

## ✨ Summary

| Aspect              | Value                                                |
| ------------------- | ---------------------------------------------------- |
| **Build Directory** | Project root (boltlink-platform/)                    |
| **Build Context**   | `.` (current directory)                              |
| **Dockerfile Path** | `-f backend/Dockerfile`                              |
| **COPY Paths**      | Relative (e.g., `src/` not `backend/src/`)           |
| **Command**         | `docker build -f backend/Dockerfile -t app:latest .` |

---

**Result After Fix:**
✅ Docker build now correctly finds all files
✅ Deployment to Render/Railway/Heroku works
✅ docker-compose up works
✅ CI/CD pipelines work correctly
