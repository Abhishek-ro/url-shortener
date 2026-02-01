import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import linkRoutes from './routes/link.routes';
import { redirectUrl } from './controllers/link.controller';
import prisma from './config/prisma';

dotenv.config();

const app = express();

// Trust proxy for Express - needed for rate limiting and X-Forwarded-For headers
app.set('trust proxy', 1);

// CORS configuration: support explicit origin list or wildcard
const allowedOriginsEnv =
  process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
const corsOptions = (() => {
  if (allowedOriginsEnv.trim() === '*') {
    // When wildcard is used with credentials, echo back the request origin
    return {
      origin: (origin: any, callback: any) => callback(null, true),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
      credentials: true,
      maxAge: 3600,
    };
  }

  const allowed = allowedOriginsEnv.split(',').map((s) => s.trim());
  return {
    origin: (origin: any, callback: any) => {
      // Allow non-browser (curl/postman) requests when origin is undefined
      if (!origin) return callback(null, true);
      if (allowed.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true,
    maxAge: 3600,
  };
})();

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains',
  );
  next();
});

app.get('/', (req, res) => {
  res.send('BoltLink Backend Running');
});
app.use('/api', linkRoutes);
app.get('/:code', redirectUrl);

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🛑 Shutting down gracefully...');
  server.close(async () => {
    console.log('📤 Server closed');
    await prisma.$disconnect();
    console.log('🗄️  Prisma disconnected');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after 10s');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
