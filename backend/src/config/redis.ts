import { createClient } from 'redis';

const redis = createClient({
  url: 'redis://localhost:6379',
});

redis.on('connect', () => {
  console.log('🔥 Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

redis.connect();

export default redis;
