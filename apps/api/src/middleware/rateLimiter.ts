import { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;
const PREFIX = 'ratelimit:';

export function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const key = PREFIX + (req.ip || req.socket.remoteAddress || 'unknown');

  redis
    .multi()
    .incr(key)
    .pttl(key)
    .exec((err, replies) => {
      if (err) {
        next();
        return;
      }

      const count = replies[0] as number;
      let ttl = replies[1] as number;

      if (ttl < 0) {
        redis.pexpire(key, WINDOW_MS);
        ttl = WINDOW_MS;
      }

      res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS));
      res.setHeader(
        'X-RateLimit-Remaining',
        String(Math.max(0, MAX_REQUESTS - count))
      );

      if (count > MAX_REQUESTS) {
        res.setHeader('Retry-After', String(Math.ceil(ttl / 1000)));
        res.status(429).json({ error: 'Too many requests' });
        return;
      }

      next();
    });
}
