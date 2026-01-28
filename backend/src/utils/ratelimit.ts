import rateLimit from 'express-rate-limit';

export const shortenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, slow down.' },
});

export const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP.',
});

export const keyGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 API keys per IP per hour
  message: { error: 'Too many API key generation attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
