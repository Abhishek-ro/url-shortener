import rateLimit from 'express-rate-limit';

export const shortenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, 
  message: { error: 'Too many requests, slow down.' },
});

export const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 1000, 
  message: 'Too many requests from this IP.',
});
