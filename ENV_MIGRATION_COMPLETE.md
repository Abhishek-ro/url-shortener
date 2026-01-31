# Environment Configuration Migration Complete

## What Was Done

All hardcoded sensitive data (URLs, API keys, localhost references) have been moved to environment files and now use `process.env` for backend and `import.meta.env` for frontend (Vite).

---

## Changes Made

### 1. **Backend Environment File** (`backend/.env`)

Added the following variables:

```env
DATABASE_URL="postgresql://postgres:Abhishek123@localhost:5432/boltlink?schema=public"
ALLOWED_ORIGINS=https://url-shortener-pearl-six.vercel.app,http://localhost:3000
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
```

### 2. **Frontend Environment File** (`frontend/.env.local`)

Should contain:

```env
GEMINI_API_KEY=PLACEHOLDER_API_KEY
VITE_API_KEY=xxxx
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_KEY=PLACEHOLDER_API_KEY
VITE_FRONTEND_URL=http://localhost:3000
```

---

## Code Updates

### Backend Files Modified:

#### `backend/src/index.ts`

- **CORS Configuration**: Changed from wildcard `'*'` to `process.env.ALLOWED_ORIGINS.split(',')`
- **Port**: Now uses `process.env.PORT || 5000`
- **Frontend URL**: Added `process.env.FRONTEND_URL` for redirects

```typescript
// Before
origin: '*';

// After
origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
```

#### `backend/src/controllers/link.controller.ts`

- **Password Protected Redirect**: Changed hardcoded `http://localhost:3000` to:

```typescript
const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?code=${code}`;
```

- **Rate Limit Redirect**: Changed hardcoded `http://localhost:3000` to:

```typescript
return res.redirect(
  `${process.env.FRONTEND_URL || 'http://localhost:3000'}/rate-limit?code=${code}`,
);
```

**Affected Functions:**

- `redirectUrl()` - 2 instances updated
- Both cache hit and database lookups now use env variable

### Frontend Files Modified:

#### `frontend/src/components/LinkCreator.tsx` (Already updated in previous step)

- All `window.location.origin` references now use `import.meta.env.VITE_API_URL.replace('/api', '')`

---

## Environment Files Created

### `backend/.env.example`

A template showing all available configuration options:

- Database URL
- Server port and environment
- Frontend URL for redirects
- CORS origins
- Redis URL
- JWT secret
- Rate limiting options
- Queue worker settings

### `frontend/.env.example`

A template for frontend configuration:

- API URL
- Frontend URL
- Gemini AI key
- Legacy compatibility keys

---

## How to Use

### For Development:

1. **Backend**:
   - Copy `.env.example` to `.env`
   - Fill in your actual values
   - Restart the backend server

2. **Frontend**:
   - Update `.env.local` with your backend URL
   - Restart the frontend dev server

### For Production:

1. **Set Environment Variables** on your deployment platform:
   - AWS: Secrets Manager / Parameter Store
   - Vercel/Netlify: Environment Variables dashboard
   - Docker: Environment variables in compose file
   - Kubernetes: ConfigMap / Secrets

2. **Key Variables to Change**:
   - `FRONTEND_URL` → Your production frontend domain
   - `ALLOWED_ORIGINS` → Your production domains
   - `JWT_SECRET` → Generate a strong random key
   - `DATABASE_URL` → Production database URL
   - `REDIS_URL` → Production Redis URL

---

## Example Production Config

### Backend Production `.env`:

```env
DATABASE_URL="postgresql://prod-user:prod-pass@prod-db:5432/boltlink?schema=public"
ALLOWED_ORIGINS=https://example.com,https://api.example.com
PORT=5000
FRONTEND_URL=https://example.com
NODE_ENV=production
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=generate-with-openssl-rand-base64-32
```

### Frontend Production `.env`:

```env
VITE_API_URL=https://api.example.com/api
VITE_FRONTEND_URL=https://example.com
VITE_GEMINI_KEY=your-real-gemini-key
```

---

## Security Benefits

✅ **No Hardcoded Secrets**: All sensitive data moved to env files
✅ **Flexible Deployment**: Easy to switch between dev/staging/production
✅ **CORS Protection**: Configurable instead of wildcard `*`
✅ **Easy Rotation**: Change secrets without code redeploy
✅ **Audit Trail**: Environment variables are logged separately from code
✅ **Backward Compatible**: Fallback defaults if env vars not set

---

## Files to Create/Update

- ✅ `backend/.env` - Updated
- ✅ `backend/.env.example` - Created
- ✅ `frontend/.env.example` - Created
- ⚠️ `frontend/.env.local` - Manual update needed (new file provided as `.env.local.new`)
- ✅ `backend/src/index.ts` - Updated
- ✅ `backend/src/controllers/link.controller.ts` - Updated
- ✅ `frontend/src/components/LinkCreator.tsx` - Already updated

---

## Next Steps

1. Update `frontend/.env.local` manually with the new variables
2. Restart both backend and frontend servers
3. Test all features:
   - Create a link
   - Test password-protected links
   - Test rate-limited links
   - Verify QR code generation

4. Review and commit `.env.example` files to version control
5. Never commit actual `.env` files - add to `.gitignore`
