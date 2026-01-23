import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../services/apiKey.service';

export async function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const key = req.headers['x-api-key'];

  if (!key || typeof key !== 'string') {
    return res.status(401).json({ error: 'API Key missing' });
  }

  const exists = await validateApiKey(key);

  if (!exists) {
    return res.status(403).json({ error: 'Invalid API Key' });
  }

  next();
}
