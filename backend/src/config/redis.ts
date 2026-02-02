import { createClient } from 'redis';

const redisConfig: any = {
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
};

// If REDIS_PASSWORD is set separately, add it to config
if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

const redis = createClient(redisConfig);

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
