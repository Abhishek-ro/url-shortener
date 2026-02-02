import { createClient } from 'redis';

// Parse REDIS_URL and extract auth if present, or use REDIS_PASSWORD env var
const redisUrl = process.env.REDIS_URL;
const redisPassword = process.env.REDIS_PASSWORD;

let redisConfig: any = {};

if (redisUrl) {
  try {
    const url = new URL(redisUrl);
    // If URL has password in it (redis://:password@host:port), use as-is
    if (redisUrl.includes(':') && redisUrl.includes('@')) {
      redisConfig.url = redisUrl;
    } else {
      // URL doesn't have auth, construct it
      const host = url.hostname;
      const port = url.port || 6379;
      if (redisPassword) {
        redisConfig.url = `redis://:${redisPassword}@${host}:${port}`;
      } else {
        redisConfig.url = `redis://${host}:${port}`;
      }
    }
  } catch {
    // If URL parsing fails, try direct config
    redisConfig.url = redisUrl;
  }
} else if (redisPassword) {
  // Fallback if only password is set
  console.warn(
    '⚠️ REDIS_URL not set, using REDIS_PASSWORD for auth (assumes localhost:6379)',
  );
  redisConfig.url = `redis://:${redisPassword}@localhost:6379`;
}

redisConfig.socket = {
  reconnectStrategy: (retries: number) => {
    if (retries > 10) {
      console.warn(
        '⚠️ Redis failed after 10 retries. Running in degraded mode.',
      );
      return new Error('Max retries reached');
    }
    return Math.min(retries * 50, 500);
  },
};

const redis = createClient(redisConfig);

let isConnected = false;

redis.on('connect', () => {
  console.log('🔌 Redis connecting...');
});

redis.on('ready', () => {
  console.log('✅ Redis ready');
  isConnected = true;
});

redis.on('error', (err: any) => {
  // Log auth errors separately
  if (err.message && err.message.includes('NOAUTH')) {
    console.error('❌ Redis authentication failed:', err.message);
    console.error(
      '💡 Hint: Check REDIS_URL includes :password@ or set REDIS_PASSWORD env var',
    );
  } else if (!isConnected) {
    console.warn('⚠️ Redis unavailable. Continuing without Redis.');
  } else {
    console.error('❌ Redis runtime error:', err);
  }
});

redis.connect().catch((err: any) => {
  if (err.message && err.message.includes('NOAUTH')) {
    console.error('❌ Redis auth error on connect:', err.message);
  } else {
    console.warn('⚠️ Redis connection failed. Caching & rate-limit disabled.');
  }
});

// Handle all unhandled rejections from Redis to prevent app crash
process.on('unhandledRejection', (reason: any) => {
  if (
    reason?.message?.includes('NOAUTH') ||
    reason?.message?.includes('Authentication')
  ) {
    // Silently suppress Redis auth rejections - we handle them gracefully
    return;
  }
  // Re-throw other unhandled rejections
  throw reason;
});

export default redis;
export { isConnected };
