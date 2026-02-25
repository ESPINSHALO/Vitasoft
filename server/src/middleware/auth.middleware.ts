import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Extension of Express's Request object that includes the authenticated user's id.
 */
export interface AuthenticatedRequest extends Request {
  userId?: number;
}

/**
 * Middleware that validates a Bearer JWT and attaches the user id to the request.
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub?: number } | string;

    if (typeof payload === 'string' || typeof payload.sub !== 'number') {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

