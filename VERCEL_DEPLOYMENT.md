# ✅ Vercel Deployment Fix - Monorepo Setup

## Problem

```
sh: line 1: vite: command not found
Error: Command "vite build" exited with 127
```

**Cause**: Vercel didn't know how to build the frontend in a monorepo structure. Dependencies weren't installed before build.

---

## Solution

### 1. Configuration File Created: `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm ci && npm run build",
  "outputDirectory": "frontend/dist",
  "env": {
    "VITE_API_URL": "@vite_api_url",
    "VITE_FRONTEND_URL": "@vite_frontend_url",
    "VITE_GEMINI_KEY": "@vite_gemini_key"
  },
  "routes": [
    {
      "src": "^/api/(.*)",
      "dest": "https://url-shortener-1-9268.onrender.com/api"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2. What This Does

- ✅ **buildCommand**: Installs dependencies and builds the frontend
- ✅ **outputDirectory**: Tells Vercel where the built files are
- ✅ **env**: Maps environment variables for the build
- ✅ **routes**: Handles SPA routing (all routes → index.html)
- ✅ **API proxy**: Optional - routes `/api/*` to your backend

---

## Setup Steps

### Step 1: Ensure `vercel.json` Exists

✅ Already created at project root

### Step 2: Set Environment Variables in Vercel Dashboard

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add these variables:

```
VITE_API_URL = https://your-backend-url/api
VITE_FRONTEND_URL = https://your-frontend-url.vercel.app
VITE_GEMINI_KEY = your-actual-gemini-key
```

### Step 3: Link Your Repository

```bash
# Install Vercel CLI
npm install -g vercel

# From project root
vercel link

# Or import from GitHub
# Go to vercel.com → Add New → Project → Import from Git
```

### Step 4: Deploy

```bash
# Deploy
vercel deploy --prod

# Or trigger from GitHub push (automatic if linked)
```

---

## Environment Variables in Vercel

Map these in Dashboard:

| Variable            | Value                          | Type            |
| ------------------- | ------------------------------ | --------------- |
| `VITE_API_URL`      | `https://your-backend.com/api` | System Variable |
| `VITE_FRONTEND_URL` | `https://your-app.vercel.app`  | System Variable |
| `VITE_GEMINI_KEY`   | `your-key-from-google`         | Secret          |

Or use Vercel's secrets:

```bash
vercel env add VITE_GEMINI_KEY
# Paste your actual key (won't be visible)
```

---

## For Monorepo Structure

If you want to deploy **both** frontend and backend:

### Option 1: Deploy Frontend to Vercel, Backend Elsewhere

**Frontend**: Vercel (current setup)
**Backend**: Railway, Render, Heroku, AWS, etc.

Update `vercel.json` to proxy API calls:

```json
"routes": [
  {
    "src": "^/api/(.*)",
    "dest": "https://your-backend-railway-url.railway.app/api/$1",
    "headers": {
      "Access-Control-Allow-Origin": "*"
    }
  },
  {
    "src": "/(.*)",
    "dest": "/index.html"
  }
]
```

### Option 2: Deploy Both to Same Platform

**Railway, Render, or AWS**: Use docker-compose

```bash
# Railway
railway login
railway link  # Link to your Railway project
railway up    # Deploy both backend and frontend

# Render
# Create two services from dashboard:
# 1. Backend: docker service from backend/Dockerfile
# 2. Frontend: static site from frontend/dist
```

---

## Troubleshooting

### Error: "vite: command not found"

**Cause**: Dependencies not installed
**Fix**: `buildCommand` in `vercel.json` includes `npm ci`

### Error: "Cannot find module"

**Cause**: `node_modules` missing
**Fix**: Ensure `npm ci` runs in buildCommand

### Error: "VITE_API_URL is undefined"

**Cause**: Environment variable not set in Vercel
**Fix**: Add to Vercel Dashboard → Environment Variables

### Build succeeds but frontend doesn't load

**Cause**: SPA routing not configured
**Fix**: `vercel.json` routes redirect all to `/index.html`

---

## Deployment Checklist

- [ ] `vercel.json` exists at project root
- [ ] `frontend/package.json` has `"build": "vite build"`
- [ ] `frontend/dist/` will be created after build
- [ ] Environment variables set in Vercel Dashboard
- [ ] Backend URL configured in `VITE_API_URL`
- [ ] Test locally: `npm run build` in frontend folder
- [ ] Push to GitHub and watch Vercel auto-deploy

---

## File Structure for Vercel

```
boltlink-platform/
├── vercel.json                 ← Vercel configuration
├── backend/
│   ├── package.json
│   ├── Dockerfile
│   └── src/
├── frontend/
│   ├── package.json            ← Build script here
│   ├── vite.config.ts
│   ├── dist/                   ← Output directory
│   ├── src/
│   └── index.html
├── docker-compose.yml
└── README.md
```

---

## Next Deploy

The next time you:

1. Push to GitHub
2. Vercel auto-deploys
3. Runs: `cd frontend && npm ci && npm run build`
4. Serves: `frontend/dist/`

---

## Test Locally

Before deploying:

```bash
# Build frontend
cd frontend
npm install
npm run build

# Check dist folder created
ls dist/  # Should show index.html and other built files

# Test locally
npm run preview  # Run built version locally
```

---

## Summary

✅ **Problem**: Vercel didn't know how to build monorepo
✅ **Solution**: Added `vercel.json` with build configuration
✅ **Result**: Vercel now knows to:

1. Go into `frontend/` directory
2. Install dependencies
3. Run `vite build`
4. Serve from `frontend/dist/`

**Status**: Ready to deploy! 🚀
