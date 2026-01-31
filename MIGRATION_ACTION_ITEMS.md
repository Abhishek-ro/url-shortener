# ✅ Environment Migration - Action Items Checklist

## 🎯 Immediate Actions (Do These Now)

### 1. Frontend Environment File Update

- [ ] Open `frontend/.env.local`
- [ ] Compare with `frontend/.env.local.new` (or manually add):
  ```env
  VITE_GEMINI_KEY=PLACEHOLDER_API_KEY
  VITE_FRONTEND_URL=http://localhost:3000
  ```
- [ ] Save the file
- [ ] **DO NOT COMMIT .env.local to Git**

### 2. Backend Environment Verification

- [ ] Open `backend/.env`
- [ ] Verify all these variables are present:
  ```env
  DATABASE_URL="postgresql://postgres:Abhishek123@localhost:5432/boltlink?schema=public"
  PORT=5000
  FRONTEND_URL=http://localhost:3000
  ALLOWED_ORIGINS=https://url-shortener-pearl-six.vercel.app,http://localhost:3000
  NODE_ENV=development
  REDIS_URL=redis://localhost:6379
  JWT_SECRET=your-secret-key-change-in-production
  ```
- [ ] Save if any changes were made

### 3. Restart Services

- [ ] Stop backend: `Ctrl+C` in backend terminal
- [ ] Restart backend: `cd backend && npm run dev`
- [ ] Wait for "🚀 Server running on port 5000"
- [ ] Stop frontend: `Ctrl+C` in frontend terminal
- [ ] Clear frontend cache: Hard refresh browser (Ctrl+Shift+R)
- [ ] Restart frontend: `cd frontend && npm run dev`
- [ ] Wait for "Local: http://localhost:3000"

---

## 🧪 Testing Checklist

### Basic Functionality

- [ ] Frontend loads without console errors
- [ ] Can navigate to link creator page
- [ ] Enter a test URL: `https://github.com`
- [ ] Click "Create Link"
- [ ] Verify short code is created
- [ ] Verify QR code appears
- [ ] **IMPORTANT**: QR code URL bar should show `http://localhost:5000/...` (NOT 3000)

### Short Link Features

- [ ] Can copy short link to clipboard (copy button shows ✓)
- [ ] Short link displayed shows correct URL (:5000 not :3000)
- [ ] "Test Link" button opens new tab with correct URL
- [ ] Short link works when opened (redirects to GitHub)

### Advanced Features

- [ ] Password Protection: Create link with password
  - [ ] Link shows as protected in list
  - [ ] Opens verify page on access
  - [ ] Verify page redirects back to frontend correctly
- [ ] Rate Limiting: Enable rate limiting
  - [ ] Link accepts rate limiting setting
  - [ ] Exceeding limit shows rate limit page
- [ ] Link Expiration: Set expiry date
  - [ ] Link shows expiry time
  - [ ] Expired links show "expired" message
- [ ] Campaign Association: Add link to campaign
  - [ ] Link appears in campaign

### API Integration

- [ ] API key generation works (visible in browser console)
- [ ] API requests include `x-api-key` header
- [ ] No 401 Unauthorized errors
- [ ] No CORS errors in console

### QR Code

- [ ] QR code displays immediately after link creation
- [ ] QR code is scannable (use phone camera)
- [ ] Scanned link opens to backend URL (:5000)
- [ ] Download QR buttons are visible

---

## 📝 Git/Version Control

- [ ] **DO NOT COMMIT** `backend/.env`
- [ ] **DO NOT COMMIT** `frontend/.env.local`
- [ ] **DO COMMIT** `.env.example` files (documentation)
- [ ] **DO COMMIT** documentation files:
  - [ ] `ENV_MIGRATION_COMPLETE.md`
  - [ ] `ENV_QUICK_REFERENCE.md`
  - [ ] `ENVIRONMENT_MIGRATION_SUMMARY.md`
  - [ ] `CHANGES_DETAILED.md`
- [ ] Verify `.gitignore` includes:
  ```
  .env
  .env.local
  .env.*.local
  ```

### Git Commands

```bash
# Check what will be committed
git status

# Add only documentation files
git add ENV_*.md
git add CHANGES_DETAILED.md
git add backend/.env.example
git add frontend/.env.example

# Verify .env files are NOT included
git status  # Should show NO .env files

# Commit
git commit -m "chore: migrate sensitive data to environment variables

- Move hardcoded URLs to process.env (backend) and import.meta.env (frontend)
- Harden CORS to use ALLOWED_ORIGINS instead of wildcard
- Add FRONTEND_URL for configurable redirects
- Add .env.example templates for both backend and frontend
- Update documentation with migration details"
```

---

## 🚀 Deployment Preparation

### For Next Deployment (Staging/Production)

- [ ] Update deployment platform environment variables:

  **Backend** (Vercel/Railway/Render/etc):

  ```
  PORT = 5000
  FRONTEND_URL = https://your-staging-domain.com
  ALLOWED_ORIGINS = https://your-staging-domain.com
  DATABASE_URL = production-database-url
  REDIS_URL = production-redis-url
  JWT_SECRET = generate-new-strong-key
  NODE_ENV = production
  ```

  **Frontend** (Vercel/Netlify):

  ```
  VITE_API_URL = https://api.your-staging-domain.com/api
  VITE_FRONTEND_URL = https://your-staging-domain.com
  VITE_GEMINI_KEY = your-real-gemini-key
  ```

- [ ] Test staging deployment
- [ ] Verify all features work in staging
- [ ] Get approval for production deployment

### Docker/Container Deployment

- [ ] If using Docker, add environment variables to:
  - [ ] `docker-compose.yml`
  - [ ] Kubernetes manifests (if applicable)
  - [ ] CI/CD pipeline secrets

---

## 🔍 Verification Tasks

### Code Review

- [ ] Review `backend/src/index.ts` changes
- [ ] Review `backend/src/controllers/link.controller.ts` changes
- [ ] Review `frontend/src/components/LinkCreator.tsx` changes
- [ ] Verify no hardcoded URLs remain in these files

### Configuration Review

- [ ] Verify `FRONTEND_URL` is used in all redirect scenarios
- [ ] Verify `ALLOWED_ORIGINS` includes all required domains
- [ ] Verify `VITE_API_URL` points to correct backend
- [ ] Verify fallback defaults are sensible

### Security Review

- [ ] No secrets in source code
- [ ] No credentials in environment variable defaults
- [ ] CORS is restricted (not `*`)
- [ ] `.env` files in `.gitignore`

---

## 📚 Documentation Review

- [ ] Read `ENV_MIGRATION_COMPLETE.md`
- [ ] Read `ENV_QUICK_REFERENCE.md`
- [ ] Understand how to use in each environment
- [ ] Share documentation with team

---

## 🎓 Team Communication

- [ ] Inform team about environment variable changes
- [ ] Share `.env.example` files
- [ ] Document how to set up local environment
- [ ] Update onboarding documentation

### Template for Team Notification

```
Subject: Environment Configuration Update - Action Required

Hi Team,

We've migrated all hardcoded sensitive data to environment variables.

**Action Required:**
1. Update your local .env files (see .env.example)
2. Restart backend and frontend
3. Test link creation and QR code (verify URL is :5000 not :3000)

**Key Changes:**
- FRONTEND_URL configurable in backend
- CORS hardened with ALLOWED_ORIGINS
- All localhost hardcoding removed

See ENV_QUICK_REFERENCE.md for details.

Questions? Check the documentation or reach out.

Thanks!
```

---

## 🔄 Rollback Plan (If Needed)

If something breaks:

### Option 1: Revert Changes

```bash
git revert <commit-hash>
npm run dev  # Restart
```

### Option 2: Manual Fixes

```bash
# Restore original .env values
# Restart services
# Test again
```

---

## ✨ Success Criteria

All of these should be true:

- ✅ Backend starts without errors
- ✅ Frontend starts without errors
- ✅ Short links created point to `:5000` (not `:3000`)
- ✅ QR codes are scannable and correct
- ✅ Password-protected links work
- ✅ Rate-limited links work
- ✅ No CORS errors in console
- ✅ No environment variable warnings
- ✅ No hardcoded localhost in production builds
- ✅ Documentation complete and shared

---

## 📞 Support

If you encounter issues:

1. **Check console** for error messages
2. **Check .env files** for missing variables
3. **Restart services** after .env changes (Vite doesn't hot-reload)
4. **Hard refresh browser** (Ctrl+Shift+R for frontend)
5. **Review documentation** (ENV_QUICK_REFERENCE.md)
6. **Check git status** to ensure .env files aren't staged

---

## 🎉 Final Checklist

- [ ] All immediate actions completed
- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Team notified
- [ ] Ready for production deployment

**Once all checkboxes are marked, the migration is complete!**

---

**Last Updated**: January 31, 2026
**Status**: Ready for Deployment ✅
