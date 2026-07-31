import { NextFunction, Request, Response } from 'express';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

export function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS) {
    res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000));
    res.status(429).json({ error: 'Too many requests' });
    return;
  }

  next();
}
