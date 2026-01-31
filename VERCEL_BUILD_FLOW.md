# 🔄 Vercel Build Flow - What Happens

## Before the Fix ❌

```
Vercel receives repository
↓
Looks for vercel.json ❌ NOT FOUND
↓
Looks for package.json in root ❌ NOT FOUND (monorepo issue)
↓
Confused - tries to guess
↓
Finds frontend/package.json
↓
Tries to run: npm install && vite build
↓
ERROR: vite command not found ❌
```

---

## After the Fix ✅

```
Vercel receives repository
↓
Reads vercel.json ✅ FOUND
↓
Sees buildCommand: "cd frontend && npm ci && npm run build"
↓
Executes step by step:
  1. cd frontend          ✅ Navigate to frontend dir
  2. npm ci               ✅ Install dependencies
  3. npm run build        ✅ Run vite build
↓
Creates frontend/dist/ with built files
↓
Serves frontend/dist/ on vercel.app
↓
Routes all requests to index.html (SPA) ✅
```

---

## vercel.json Breakdown

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm ci && npm run build",
  ↑                          ↑              ↑              ↑
  |                          |              |              └─ Run build script
  |                          |              └──── Install dependencies
  |                          └─────────────────── Navigate to frontend
  └────────────────────────────────────────────── Vercel version

  "outputDirectory": "frontend/dist",
  ↑                  ↑
  |                  └─ Where built files are
  └────────────────── Vercel will serve this directory

  "env": {
    "VITE_API_URL": "@vite_api_url",
    ↑               ↑
    |               └─ Reference to Vercel secret/env var
    └─ Frontend needs this to know where backend is
  },

  "routes": [
    {
      "src": "^/api/(.*)",
      "dest": "https://backend-url/api/$1"
      ↑       ↑                          ↑
      |       |                          └─ Regex capture group 1
      |       └──────────────────────── Forward to backend
      └────────────────────────────── If path starts with /api
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
      ↑       ↑
      |       └─ Always serve index.html
      └────── For any other path (SPA routing)
    }
  ]
}
```

---

## Environment Variables Resolution

### During Build (buildCommand)

```bash
cd frontend && npm ci && npm run build
                                 ↓
                    Runs: vite build
                            ↓
         Vite reads: import.meta.env.VITE_API_URL
                            ↓
         Looks in .env files, then environment variables
                            ↓
         Finds: VITE_API_URL = https://backend-url/api
                            ↓
         Bakes into built JavaScript files
```

### At Runtime (Browser)

```javascript
// In built application:
const apiUrl = import.meta.env.VITE_API_URL;
// Returns: https://backend-url/api

const response = await fetch(`${apiUrl}/links`);
// Calls: https://backend-url/api/links
```

---

## Build Timeline

### 1. Code Received

```
GitHub push → Vercel webhook notified → Build starts
```

### 2. Build Process (2-3 minutes)

```
vercel.json read
  ↓
Check environment variables
  ↓
Execute: cd frontend && npm ci && npm run build
  ├─ npm ci (90 seconds)
  │  ├─ Download packages from npm registry
  │  ├─ Install into node_modules
  │  └─ Create package-lock.json
  │
  ├─ vite build (30 seconds)
  │  ├─ Compile TypeScript
  │  ├─ Bundle JavaScript/CSS
  │  ├─ Optimize assets
  │  └─ Create dist/
  │
  └─ Success ✅
```

### 3. Deploy

```
Copy dist/ to Vercel CDN edge servers
  ↓
Propagate globally
  ↓
Live at: https://your-app.vercel.app ✅
```

---

## File Changes During Build

### Before Build

```
backend/                          (not used)
frontend/
├── src/
│   ├── App.tsx
│   ├── components/
│   └── services/
├── package.json
├── vite.config.ts
└── tsconfig.json

node_modules/                     (not present)
dist/                             (not present)
```

### After Build

```
backend/                          (still not used)
frontend/
├── src/                          (not in output)
├── package.json
├── vite.config.ts
├── node_modules/                 (created, 500MB+)
└── dist/                         (created, ~2-5MB)
    ├── index.html
    ├── assets/
    │   ├── index-xxx.js          (minified)
    │   └── index-xxx.css         (minified)
    └── vite.svg
```

### Uploaded to Vercel

```
Only dist/ folder (~2-5MB)
├── index.html
└── assets/

Everything else pruned (node_modules not included)
```

---

## Environment Variable Injection

### In vercel.json

```json
"env": {
  "VITE_API_URL": "@vite_api_url"
  ↑               ↑
  |               └─ Means: use Vercel env var VITE_API_URL
  └─ Available during build as: process.env.VITE_API_URL
}
```

### Build Process

```bash
$ npm run build
  ↓
Vite sees: process.env.VITE_API_URL = "https://backend-url/api"
  ↓
In code: const api = import.meta.env.VITE_API_URL
  ↓
Becomes: const api = "https://backend-url/api"
  ↓
Baked into JavaScript file
  ↓
Browser loads already-configured API URL
```

---

## Error Scenarios

### Scenario 1: No vercel.json ❌

```
ERROR: No buildCommand found
Vercel tries to guess
Looks at package.json
Finds vite build
Tries to install vite... fails
ERROR: vite: command not found
```

**Fix**: ✅ vercel.json created

### Scenario 2: Missing env variable ❌

```
Build command runs: cd frontend && npm ci && npm run build
npm ci ✅
vite build runs
  Looks for: process.env.VITE_API_URL
  Finds: undefined
JavaScript built with: api = undefined
Browser tries: fetch(undefined/links)
ERROR: Network error
```

**Fix**: ✅ Add to Vercel Environment Variables

### Scenario 3: Wrong outputDirectory ❌

```
Build succeeds, creates frontend/dist
But vercel.json says: outputDirectory: "dist"
Vercel looks in: dist/ (root level, not frontend/dist)
Doesn't find index.html
ERROR: 404 Not Found
```

**Fix**: ✅ outputDirectory set to frontend/dist

---

## Verification Checklist

- [ ] `vercel.json` exists at project root
- [ ] `buildCommand` includes `cd frontend`
- [ ] `outputDirectory` is `frontend/dist`
- [ ] Environment variables set in Vercel dashboard
- [ ] GitHub repository connected to Vercel
- [ ] `frontend/package.json` has `"build": "vite build"`
- [ ] `frontend/src/` directory exists
- [ ] No syntax errors in TypeScript
- [ ] `vite.config.ts` properly configured
- [ ] Test locally: `npm run build` works

---

## Debug: Check Build Logs

**Vercel Dashboard → Deployments → Click latest**

Look for these lines:

```
✅ [1/4] Running "vercel build"
✅ [2/4] Detected `package.json` in `frontend`
✅ [3/4] Installing dependencies...
✅ [4/4] Building application...
✅ Build succeeded
✅ Deployed
```

If you see any ❌, check the error message above it.

---

## Success Indicators

✅ Build logs show: "Build succeeded"
✅ Deployment shows: "Ready"
✅ Can visit: https://your-app.vercel.app
✅ App loads without 404 errors
✅ API calls work (if backend URL correct)
✅ Features work (create link, etc.)

🎉 **Deployment successful!**
