import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        console.warn(
          '❌ Redis connection failed after 10 retries. Running in degraded mode.',
        );
        return new Error('Max retries reached');
      }
      return Math.min(retries * 50, 500);
    },
  },
});

let isConnected = false;

redis.on('connect', () => {
  console.log('✅ Redis connected');
  isConnected = true;
});

redis.on('error', (err) => {
  if (!isConnected) {
    console.warn('⚠️  Redis connection failed. Some features may be limited.');
  } else {
    console.error('❌ Redis error:', err);
  }
});

redis.on('ready', () => {
  isConnected = true;
});

redis.connect().catch(() => {
  console.warn(
    '⚠️  Running without Redis. Caching and rate-limiting disabled.',
  );
});

export default redis;
export { isConnected };
