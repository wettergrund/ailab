import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextFunction, Request, Response } from 'express';
import { rateLimiter } from '../middleware/rateLimiter';

vi.mock('ioredis', () => {
  const createMockRedis = () => ({
    multi: vi.fn().mockReturnThis(),
    incr: vi.fn().mockReturnThis(),
    pttl: vi.fn().mockReturnThis(),
    exec: vi
      .fn()
      .mockImplementation(
        (cb: (err: Error | null, replies: [number, number]) => void) =>
          cb(null, [1, -1])
      ),
    pexpire: vi.fn(),
  });
  return { default: vi.fn(createMockRedis) };
});

function createMockRes(): Partial<Response> {
  const headers: Record<string, string | string[]> = {};
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn((name: string, value: string) => {
      headers[name] = value;
    }),
    getHeader: vi.fn((name: string) => headers[name]),
  } as unknown as Response;
  return res;
}

describe('rateLimiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows the first request', async () => {
    const req = {
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn();

    await rateLimiter(req, res, next as NextFunction);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects requests over the limit', async () => {
    let callCount = 0;
    vi.resetModules();
    vi.doMock('ioredis', () => {
      const createMockRedis = () => ({
        multi: vi.fn().mockReturnThis(),
        incr: vi.fn().mockReturnThis(),
        pttl: vi.fn().mockReturnThis(),
        exec: vi
          .fn()
          .mockImplementation(
            (cb: (err: Error | null, replies: [number, number]) => void) => {
              callCount++;
              if (callCount <= 100) {
                cb(null, [callCount, -1]);
              } else {
                cb(null, [101, 50000]);
              }
            }
          ),
        pexpire: vi.fn(),
      });
      return { default: vi.fn(createMockRedis) };
    });
    const { rateLimiter: rl } = await import('../middleware/rateLimiter');

    const req = {
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn();

    for (let i = 0; i < 100; i++) {
      await rl(req, res, next as NextFunction);
    }

    const callsBefore = next.mock.calls.length;
    await rl(req, res, next as NextFunction);
    expect(next.mock.calls.length).toBe(callsBefore);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'Too many requests' });
  });
});
