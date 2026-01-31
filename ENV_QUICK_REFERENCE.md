# Environment Variable Quick Reference

## Backend (Node.js + Express)

### Environment Variables Used in Code

| Variable          | Usage                                  | Default                  | Scope                                |
| ----------------- | -------------------------------------- | ------------------------ | ------------------------------------ |
| `PORT`            | Server port                            | `5000`                   | `src/index.ts`                       |
| `FRONTEND_URL`    | Frontend base URL for redirects        | `http://localhost:3000`  | `src/controllers/link.controller.ts` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:3000`  | `src/index.ts`                       |
| `DATABASE_URL`    | PostgreSQL connection string           | Required                 | `src/config/prisma.ts`               |
| `REDIS_URL`       | Redis connection URL                   | `redis://localhost:6379` | `src/config/redis.ts`                |
| `JWT_SECRET`      | JWT signing key                        | Required                 | `src/services/auth.service.ts`       |
| `NODE_ENV`        | Environment (development/production)   | `development`            | Throughout                           |

### How to Use in Backend Code

```typescript
// Access environment variables using process.env
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:3000'
).split(',');

// Example: Using in code
const verifyUrl = `${process.env.FRONTEND_URL}/verify?code=${code}`;
```

---

## Frontend (React + Vite)

### Environment Variables Used in Code

| Variable            | Usage                 | Default                 | Scope                            |
| ------------------- | --------------------- | ----------------------- | -------------------------------- |
| `VITE_API_URL`      | Backend API base URL  | Required                | `src/services/api.service.ts`    |
| `VITE_FRONTEND_URL` | Frontend base URL     | `http://localhost:3000` | Components                       |
| `VITE_GEMINI_KEY`   | Google Gemini API key | Optional                | `src/components/LinkCreator.tsx` |

### How to Use in Frontend Code

```typescript
// Access Vite environment variables using import.meta.env
const apiUrl = import.meta.env.VITE_API_URL; // e.g., http://localhost:5000/api
const frontendUrl = import.meta.env.VITE_FRONTEND_URL; // e.g., http://localhost:3000
const geminiKey = import.meta.env.VITE_GEMINI_KEY;

// Remove /api suffix when needed
const backendBaseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
// Result: http://localhost:5000

// Example: Using in code
const shortLinkUrl = `${backendBaseUrl}/${shortCode}`;
const qrCodeUrl = await generateQRCode(shortLinkUrl);
```

---

## Local Development Setup

### Step 1: Backend Configuration

Create or update `backend/.env`:

```bash
cd backend
cp .env.example .env
# Then edit .env with your values
```

Default content for local dev:

```env
DATABASE_URL="postgresql://postgres:Abhishek123@localhost:5432/boltlink?schema=public"
PORT=5000
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-not-for-production
```

### Step 2: Frontend Configuration

Create or update `frontend/.env.local`:

```bash
cd frontend
cat > .env.local << EOF
VITE_API_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:3000
VITE_GEMINI_KEY=your-actual-gemini-key-here
EOF
```

### Step 3: Start Services

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Production Deployment Setup

### AWS Deployment Example

**Elastic Beanstalk Environment Variables:**

Backend:

```
DATABASE_URL = arn:aws:secretsmanager:...
FRONTEND_URL = https://example.com
ALLOWED_ORIGINS = https://example.com,https://www.example.com
PORT = 5000
NODE_ENV = production
REDIS_URL = redis://prod-redis.abc123.ng.0001.use1.cache.amazonaws.com:6379
JWT_SECRET = arn:aws:secretsmanager:...
```

Frontend (Vercel/Netlify):

```
VITE_API_URL = https://api.example.com/api
VITE_FRONTEND_URL = https://example.com
VITE_GEMINI_KEY = your-real-key
```

---

## Docker Compose Example

```yaml
version: '3.9'

services:
  backend:
    image: boltlink-backend:latest
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/boltlink
      - FRONTEND_URL=http://frontend:3000
      - ALLOWED_ORIGINS=http://frontend:3000
      - PORT=5000
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
    ports:
      - '5000:5000'
    depends_on:
      - db
      - redis

  frontend:
    image: boltlink-frontend:latest
    environment:
      - VITE_API_URL=http://backend:5000/api
      - VITE_FRONTEND_URL=http://localhost:3000
      - VITE_GEMINI_KEY=your-key
    ports:
      - '3000:3000'
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: boltlink
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  db_data:
```

---

## Troubleshooting

### Issue: CORS Error - "Origin not allowed"

**Solution**: Add your frontend URL to `ALLOWED_ORIGINS`:

```bash
ALLOWED_ORIGINS=http://localhost:3000,https://myapp.com
```

### Issue: API calls not working - 404 errors

**Solution**: Verify `VITE_API_URL` in frontend .env:

```bash
VITE_API_URL=http://localhost:5000/api  # ✅ Correct
# NOT: http://localhost:5000             # ❌ Missing /api
```

### Issue: Redirect fails on password-protected links

**Solution**: Ensure `FRONTEND_URL` is set correctly in backend:

```bash
FRONTEND_URL=http://localhost:3000  # For dev
FRONTEND_URL=https://example.com    # For prod
```

### Issue: Environment variables showing as undefined

**Solution**:

- Backend: Restart with `npm run dev`
- Frontend: Hard refresh browser (Ctrl+Shift+R)
- Vite doesn't hot-reload .env changes

---

## Security Checklist

- ✅ Never commit `.env` files to Git
- ✅ Add `*.env` to `.gitignore`
- ✅ Use strong `JWT_SECRET` in production (generate with `openssl rand -base64 32`)
- ✅ Store secrets in a secrets manager (AWS Secrets Manager, etc.)
- ✅ Restrict `ALLOWED_ORIGINS` to your domains only
- ✅ Use HTTPS URLs in production
- ✅ Rotate secrets periodically
- ✅ Never log environment variables with sensitive data

---

## Reference

- Backend: Uses `process.env` (Node.js standard)
- Frontend: Uses `import.meta.env` (Vite standard)
- Both require `.env` file restart to load changes
- No secrets should be hardcoded in source code
