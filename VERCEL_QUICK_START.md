# 🚀 Vercel Deployment - Quick Action Items

## ✅ What Was Done

Created `vercel.json` configuration file that tells Vercel:

- Where to find the frontend (`frontend/` directory)
- How to build it (`cd frontend && npm ci && npm run build`)
- Where the output goes (`frontend/dist/`)

---

## 🎯 Immediate Actions

### 1. Set Environment Variables in Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these 3 variables:

```
VITE_API_URL = https://your-backend-url/api
VITE_FRONTEND_URL = https://your-vercel-url.vercel.app
VITE_GEMINI_KEY = your-actual-gemini-key
```

**Important**:

- `VITE_API_URL` should point to your **backend** (Railway, Render, etc.)
- `VITE_GEMINI_KEY` is your actual Google Gemini API key

### 2. Update Backend URL

If you don't know your backend URL yet:

**Option A**: Deploy backend first, then update frontend with backend URL
**Option B**: Leave as placeholder, update later

### 3. Deploy

**Option A**: Auto-deploy from GitHub

```bash
git push origin backend-core
# Vercel auto-deploys when you push
```

**Option B**: Manual deploy

```bash
vercel deploy --prod
```

---

## 📋 Environment Variables Guide

### What Each Variable Does

| Variable            | Purpose              | Example                             |
| ------------------- | -------------------- | ----------------------------------- |
| `VITE_API_URL`      | Backend API endpoint | `https://api.myapp.railway.app/api` |
| `VITE_FRONTEND_URL` | Frontend base URL    | `https://myapp.vercel.app`          |
| `VITE_GEMINI_KEY`   | AI alias suggestion  | `AIza...` (your key)                |

### How to Get These

**VITE_API_URL**:

- Deploy backend to Railway/Render first
- Copy the backend URL
- Append `/api` to it
- Example: `https://boltlink-backend.railway.app/api`

**VITE_FRONTEND_URL**:

- After Vercel deployment
- Use the Vercel-provided URL
- Example: `https://boltlink-frontend.vercel.app`

**VITE_GEMINI_KEY**:

- Go to Google AI Studio: https://aistudio.google.com/app/apikeys
- Create/copy your API key
- Paste into Vercel

---

## 🧪 Test Before Deploying

```bash
# From frontend directory
cd frontend

# Install dependencies
npm install

# Build
npm run build

# Check dist folder exists
ls dist/
# Should show: index.html, assets/, etc.

# Test preview
npm run preview
# Should open http://localhost:4173
```

---

## ✨ After Deployment

### Check Build Logs

1. Vercel Dashboard → Deployments
2. Click latest deployment
3. Check "Logs" tab for build output
4. Should see: ✅ Build succeeded

### Test the Deployed App

1. Click "Visit" in Vercel dashboard
2. Or go to your-app.vercel.app
3. Test features:
   - Create a short link
   - Check QR code
   - Verify API calls work

### Debug if Build Fails

- Check Environment Variables are set
- Check `vercel.json` exists
- Check `frontend/package.json` has build script
- Check browser console for errors (F12)

---

## 🔗 Connecting Frontend to Backend

### When Backend is Already Deployed

Update `VITE_API_URL` to point to deployed backend:

**Vercel Dashboard → Environment Variables**

```
VITE_API_URL = https://your-backend-url.railway.app/api
```

Then redeploy:

```bash
vercel deploy --prod
```

### When Backend URL Changes

1. Update in Vercel Dashboard
2. Redeploy frontend (automatic if connected to GitHub)

---

## 📚 Files Reference

- ✅ `vercel.json` - Deployment config (created)
- ✅ `frontend/package.json` - Build scripts (exists)
- ✅ `frontend/vite.config.ts` - Vite config (exists)
- ✅ `VERCEL_DEPLOYMENT.md` - Full guide (created)

---

## 🎯 Summary

| Step             | Status  | Details                       |
| ---------------- | ------- | ----------------------------- |
| 1. Config file   | ✅ Done | `vercel.json` created         |
| 2. Env variables | ⏳ TODO | Add in Vercel dashboard       |
| 3. Test locally  | ⏳ TODO | Run `npm run build`           |
| 4. Deploy        | ⏳ TODO | `git push` or `vercel deploy` |
| 5. Verify        | ⏳ TODO | Test deployed app             |

---

## 🚀 Next Steps

1. **Now**: Add environment variables to Vercel Dashboard
2. **Then**: Deploy (auto or manual)
3. **Finally**: Test the deployed application

**Expected Result**: Your frontend is live at https://your-app.vercel.app 🎉

---

**Need help?** Check `VERCEL_DEPLOYMENT.md` for detailed guide
