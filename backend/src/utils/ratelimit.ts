import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis';

// Flag to track if Redis is ready
let redisReady = false;

redis.on('ready', () => {
  redisReady = true;
  console.log('✅ Redis ready for rate limiting');
});

redis.on('error', () => {
  redisReady = false;
});

const createStore = (prefix: string) => {
  // Only use Redis if it's connected
  if (!redisReady) {
    console.warn(
      `⚠️ Redis not ready, falling back to memory store for ${prefix}`,
    );
    return undefined; // Use default memory store
  }

  try {
    return new RedisStore({
      sendCommand: async (...args: string[]) => {
        try {
          return await redis.sendCommand(args as unknown as string[]);
        } catch (err) {
          console.error(`Redis command failed for prefix ${prefix}:`, err);
          throw err;
        }
      },
      prefix,
    });
  } catch (err) {
    console.error(`Failed to create RedisStore for ${prefix}:`, err);
    return undefined; // Fall back to memory store
  }
};

export const shortenLimiter = rateLimit({
  store: createStore('rl:shorten:'),
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, slow down.' },
  skip: () => !redis.isOpen,
  standardHeaders: true,
  legacyHeaders: false,
});

export const redirectLimiter = rateLimit({
  store: createStore('rl:redirect:'),
  windowMs: 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP.',
  skip: () => !redis.isOpen,
  standardHeaders: true,
  legacyHeaders: false,
});

export const keyGenerationLimiter = rateLimit({
  store: createStore('rl:keygen:'),
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many API key generation attempts. Try again later.',
  },
  skip: () => !redis.isOpen,
  standardHeaders: true,
  legacyHeaders: false,
});
