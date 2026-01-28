# .gitignore Strategy - BoltLink Platform

**Date:** January 28, 2026  
**Purpose:** Prevent trash, secrets, and unnecessary files from entering production

---

## Overview

We've implemented a **multi-level gitignore strategy** to ensure:

- ✅ **Zero secrets** in Git (API keys, passwords, database URLs)
- ✅ **No trash files** (logs, temp files, OS artifacts)
- ✅ **No build artifacts** (dist/, node_modules, compiled JS)
- ✅ **No IDE files** (.vscode, .idea settings)
- ✅ **Production-safe repository** (only source code and configs)

---

## Files Created/Updated

### 1. **Root `.gitignore`**

**Location:** `c:\Users\Lenovo\OneDrive\Desktop\boltlink-platform\.gitignore`

**Coverage:**

- All Node.js files (node_modules, npm logs)
- All build output (dist/, \*.js)
- All environment files (.env, secrets)
- All IDE files (.vscode, .idea)
- All OS files (.DS_Store, Thumbs.db)
- All temporary files (logs/, tmp/)
- PM2, Docker, testing artifacts

**What's PROTECTED (never committed):**

```
.env files (all variants)
Secrets (*.pem, *.key, *.crt)
Database files (*.db, dump.rdb)
Logs (*.log, logs/)
Build output (dist/, node_modules/)
IDE configs (.vscode/, .idea/)
OS files (.DS_Store, Thumbs.db)
```

**What's ALLOWED (commits required):**

```
package.json (dependencies list)
.env.example (template for env vars)
README.md (documentation)
Dockerfile (build instructions)
docker-compose.yml (local setup)
tsconfig.json (TypeScript config)
LICENSE (license file)
```

---

### 2. **Backend `.gitignore`**

**Location:** `backend/.gitignore`

**Additional Coverage:**

- Prisma development database (prisma/dev.db)
- PM2 specific files (.pm2/, pm2.pid)
- Redis snapshots (dump.rdb)
- Compiled TypeScript (\*.js in dist/)
- Environment variables

**Critical Protections:**

- All .env files (production, development, test, local)
- Credentials and certificates
- Database files
- Process ID files

**Force Includes (won't be ignored):**

```
.env.example - Template for developers
package.json - Dependencies
tsconfig.json - TypeScript config
Dockerfile - Container config
ecosystem.config.js - PM2 config
pm2-setup.sh / pm2-setup.bat - Setup scripts
```

---

### 3. **Frontend `.gitignore`**

**Location:** `frontend/.gitignore`

**Coverage:**

- Build output (dist/, build/)
- Vite cache (.vite/)
- Environment files
- IDE settings
- Node modules

**Force Includes:**

```
.env.example - Env template
package.json - Dependencies
vite.config.ts - Vite config
index.html - Entry point
```

---

### 4. **K6 Load Testing `.gitignore`**

**Location:** `k6/.gitignore`

**Coverage:**

- Test results (_.csv, _.json)
- Reports and summaries
- Temporary test data

**Force Includes:**

```
*.js files (test scripts themselves)
package.json (if using node modules)
```

---

## What Gets Blocked (Security)

### Secrets & Credentials ❌

```
.env (production database URL, API keys)
.env.local (local overrides)
.env.production (prod secrets)
*.pem (private keys)
*.key (SSH keys)
*.crt (certificates)
.credentials (AWS/cloud credentials)
secrets.json (any secrets file)
```

**Why:** If .env is in Git and leaked, attackers have production database access, API keys, payment credentials, etc.

---

### Build & Dependencies ❌

```
dist/ (compiled JavaScript)
build/ (build artifacts)
node_modules/ (1GB+ of dependencies)
*.js (compiled from TypeScript)
*.map (source maps, reveal code structure)
```

**Why:** Build artifacts change constantly, dependencies are already in package.json, source maps reveal internal structure.

---

### Logs & Temporary Files ❌

```
*.log (application logs)
logs/ (log directory)
pm2.pid (process ID)
dump.rdb (Redis dump)
tmp/ (temporary files)
temp/ (temporary files)
```

**Why:** Logs contain sensitive info (user IDs, SQL queries), grow without bound, clutter history.

---

### IDE Settings ❌

```
.vscode/ (VSCode settings)
.idea/ (IntelliJ settings)
*.swp (Vim swap files)
*.swo (Vim swap files)
Thumbs.db (Windows thumbnails)
.DS_Store (macOS metadata)
```

**Why:** IDE settings are personal, shouldn't force config on team, create merge conflicts.

---

## What Gets Allowed (Production-Safe)

### Source Code ✅

```
All *.ts files (TypeScript source)
All *.tsx files (React components)
All *.json files (package.json, tsconfig.json)
README.md (documentation)
```

---

### Configuration Files ✅

```
package.json - Dependencies specification
tsconfig.json - TypeScript configuration
Dockerfile - Container build
docker-compose.yml - Local development stack
ecosystem.config.js - PM2 cluster configuration
pm2-setup.sh - Setup script
pm2-setup.bat - Setup script
.env.example - Template (no secrets)
```

---

### Documentation ✅

```
README.md - Project overview
*.md files - Documentation
LICENSE - License file
```

---

## Using Environment Variables Safely

### ❌ WRONG - Secrets in git:

```bash
# .env (committed to git)
DATABASE_URL=postgresql://user:password@prod-db.example.com/boltlink
API_KEY=sk_live_abc123def456
JWT_SECRET=mysupersecretkey
```

**Result:** Anyone with git access has production credentials!

---

### ✅ RIGHT - Secrets not in git:

```bash
# .env (in gitignore, NOT committed)
DATABASE_URL=postgresql://user:password@prod-db.example.com/boltlink
API_KEY=sk_live_abc123def456
JWT_SECRET=mysupersecretkey

# .env.example (committed to git, shows template)
DATABASE_URL=postgresql://username:password@localhost/boltlink
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
```

**Workflow:**

1. Developer clones repo
2. Copies `.env.example` to `.env`
3. Fills in `.env` with their values
4. `.env` is ignored by git (never committed)
5. Production deployment uses CI/CD environment variables (not .env files)

---

## Verification: Check What Would Be Committed

### Before pushing, verify:

```bash
# Show all files that would be staged
git status

# Show files git would commit (should NOT include):
# - .env files
# - node_modules/
# - dist/
# - *.log files
# - .vscode/, .idea/
# - .DS_Store, Thumbs.db

# List all ignored files
git status --ignored

# Preview what would be committed
git diff --cached --name-only
```

---

## Setting Up Locally

### First Time Setup:

```bash
# Clone repo
git clone <repo-url>
cd boltlink-platform

# Backend setup
cd backend
cp .env.example .env
# Edit .env with YOUR local values (database URL, Redis URL, etc.)
npm install
npm run build

# Frontend setup
cd ../frontend
cp .env.example .env
# Edit .env with YOUR local API URL
npm install

# Test to confirm nothing sensitive is staged
cd ..
git status
# Should show NOTHING committed (except normal source files)
```

---

## For Production Deployment

### Do NOT use .env files in production!

**Instead, use:**

- **Docker:** Environment variables passed via `docker run -e VAR=value`
- **Kubernetes:** Secrets mounted as environment variables
- **AWS:** Systems Manager Parameter Store or Secrets Manager
- **CI/CD:** GitHub Actions secrets, GitLab CI/CD variables

**Example (Docker):**

```bash
docker run -e DATABASE_URL=postgresql://... \
           -e API_KEY=sk_live_... \
           -e JWT_SECRET=... \
           -e REDIS_URL=redis://... \
           boltlink-backend:latest
```

**Example (Kubernetes):**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: boltlink-secrets
type: Opaque
stringData:
  DATABASE_URL: postgresql://...
  API_KEY: sk_live_...
  JWT_SECRET: ...
  REDIS_URL: redis://...

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: boltlink-backend
spec:
  template:
    spec:
      containers:
        - name: backend
          image: boltlink-backend:latest
          envFrom:
            - secretRef:
                name: boltlink-secrets
```

---

## Critical Security Reminders

### 🚨 NEVER do this:

```bash
# DON'T commit .env to git (ever)
git add .env
git commit -m "Add env file"
git push

# DON'T use -f to force add ignored files
git add -f .env

# DON'T commit passwords anywhere
# DON'T commit API keys in code
# DON'T commit database URLs in comments
```

---

### ✅ DO this instead:

```bash
# Create .env.example template
cp .env .env.example

# Remove secrets from .env.example
# Edit to show placeholders:
DATABASE_URL=postgresql://user:password@localhost/boltlink
API_KEY=your_api_key_here
JWT_SECRET=your_secret_here

# Commit only .env.example
git add .env.example
git commit -m "Add env template"
git push

# .env stays local (in .gitignore)
```

---

## Checking Git History (Important!)

### If secrets were ACCIDENTALLY committed:

```bash
# 1. Find the commits with secrets
git log --all --source --remotes -- .env

# 2. Rotate ALL secrets immediately (passwords, API keys, etc.)
# Committed secrets are now COMPROMISED

# 3. Use git filter-branch or BFG Repo Cleaner to remove from history
git filter-branch --tree-filter 'rm -f .env' -- --all

# 4. Force push to remote
git push --force-with-lease --all

# 5. Notify team to re-clone
```

---

## Summary Table

| File Type       | Ignored? | Reason                       | Examples             |
| --------------- | -------- | ---------------------------- | -------------------- |
| `.env*`         | ✅ YES   | Contains secrets             | `.env`, `.env.local` |
| `node_modules/` | ✅ YES   | Package deps in package.json | (entire directory)   |
| `dist/`         | ✅ YES   | Compiled from source         | JavaScript output    |
| `*.log`         | ✅ YES   | Temporary, sensitive data    | application.log      |
| `.vscode/`      | ✅ YES   | Personal IDE settings        | editor config        |
| `package.json`  | ❌ NO    | Dependency specification     | (source control)     |
| `.env.example`  | ❌ NO    | Template for developers      | (source control)     |
| `*.ts` files    | ❌ NO    | Source code                  | TypeScript files     |
| `README.md`     | ❌ NO    | Documentation                | (source control)     |
| `Dockerfile`    | ❌ NO    | Build config                 | (source control)     |

---

## Testing the Gitignore

```bash
# View what's ignored
git check-ignore -v .env
git check-ignore -v backend/dist/index.js
git check-ignore -v node_modules/

# View what WOULD be committed
git diff --cached --name-only

# Dry-run add all (shows what would be added)
git add -n -A

# After setup, verify nothing sensitive staged
git status
# Should show only *.ts, *.tsx, *.json, *.md files
```

---

## Next Steps

✅ **Gitignore configured** - Repository is now production-safe!

**For the team:**

1. ✅ Delete any .env files from local branches (if they exist)
2. ✅ Copy .env.example to .env and fill with LOCAL values
3. ✅ Run `git status` and verify no .env appears
4. ✅ Never commit .env files
5. ✅ Use environment variables in production deployment

**For production:**

1. ✅ Use CI/CD to set environment variables
2. ✅ Use Kubernetes Secrets for sensitive data
3. ✅ Use cloud secret managers (AWS Secrets Manager, etc.)
4. ✅ Rotate secrets every 90 days
5. ✅ Audit git history for accidental commits
