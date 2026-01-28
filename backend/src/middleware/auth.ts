import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthPayload } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token) as any;
      req.user = decoded;
    }
  } catch (error) {
    // Token is optional, so we don't throw
  }

  next();
}

export function flexibleAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = verifyToken(token) as any;
        req.user = decoded;
        return next();
      } catch (error) {
        // Try API key auth
      }
    }

    // Continue without auth - allow both authenticated and unauthenticated requests
    next();
  } catch (error) {
    next();
  }
}
