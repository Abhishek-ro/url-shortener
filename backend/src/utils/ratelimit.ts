import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis';

// Redis-backed rate limiters for distributed rate limiting across instances
export const shortenLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:shorten:',
  }),
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, slow down.' },
  skip: (req) => !redis.isOpen,
  skipSuccessfulRequests: false,
});

export const redirectLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:redirect:',
  }),
  windowMs: 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP.',
  skip: (req) => !redis.isOpen,
  skipSuccessfulRequests: false,
});

export const keyGenerationLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:keygen:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 API keys per IP per hour
  message: { error: 'Too many API key generation attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !redis.isOpen,
});
