import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        console.warn(
          '⚠️ Redis failed after 10 retries. Running in degraded mode.',
        );
        return new Error('Max retries reached');
      }
      return Math.min(retries * 50, 500);
    },
  },
});

let isConnected = false;

redis.on('connect', () => {
  console.log('🔌 Redis connecting...');
});

redis.on('ready', () => {
  console.log('✅ Redis ready');
  isConnected = true;
});

redis.on('error', (err) => {
  if (!isConnected) {
    console.warn('⚠️ Redis unavailable. Continuing without Redis.');
  } else {
    console.error('❌ Redis runtime error:', err);
  }
});

redis.connect().catch(() => {
  console.warn('⚠️ Redis connection failed. Caching & rate-limit disabled.');
});

export default redis;
export { isConnected };
