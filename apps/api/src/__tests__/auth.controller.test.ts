import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextFunction, Request, Response } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  me,
} from '../controllers/auth.controller';

vi.mock('../utils/jwt', () => {
  vi.stubEnv('JWT_SECRET', 'test-jwt-secret');
  vi.stubEnv('REFRESH_SECRET', 'test-refresh-secret');
  return {
    signAccessToken: vi.fn((payload) => `access-${payload.userId}`),
    signRefreshToken: vi.fn((payload) => `refresh-${payload.userId}`),
    verifyAccessToken: vi.fn((token) => {
      if (token === 'access-1')
        return { userId: 1, email: 'test@example.com', role: 'client' };
      throw new Error('Invalid token');
    }),
    verifyRefreshToken: vi.fn((token) => {
      if (token === 'refresh-1')
        return { userId: 1, email: 'test@example.com', role: 'client' };
      throw new Error('Invalid token');
    }),
  };
});

vi.mock('../utils/stripe', () => ({
  stripe: { paymentIntents: { create: vi.fn() } },
}));

function createMockDb() {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi
      .fn()
      .mockResolvedValue([
        { id: 1, email: 'test@example.com', role: 'client' },
      ]),
  };
  mockDb.limit.mockResolvedValue([]);
  return mockDb;
}

vi.mock('@repo/db', () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi
      .fn()
      .mockResolvedValue([
        { id: 1, email: 'test@example.com', role: 'client' },
      ]),
  };
  mockDb.limit.mockResolvedValue([]);
  return { db: mockDb, users: {}, NewUser: {}, eq: vi.fn() };
});

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

function createMockRes(): Partial<Response> {
  const cookies: Record<string, string> = {};
  const clearedCookies: string[] = [];
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    cookie: vi.fn((name: string, value: string) => {
      cookies[name] = value;
    }),
    clearCookie: vi.fn((name: string) => {
      clearedCookies.push(name);
    }),
    getHeader: vi.fn(),
  } as unknown as Response;
  return res as Response;
}

describe('auth controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = (await import('@repo/db')).db as any;
    mockDb.limit.mockResolvedValue([]);
  });

  it('registers a user and sets cookies', async () => {
    const req = {
      body: { email: 'new@example.com', password: 'password123' },
    } as Request;
    const res = createMockRes();

    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: { id: 1, email: 'test@example.com', role: 'client' },
    });
    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      'access-1',
      expect.objectContaining({ httpOnly: true })
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-1',
      expect.objectContaining({ httpOnly: true })
    );
  });

  it('logs in a user and sets cookies', async () => {
    const mockDb = (await import('@repo/db')).db as any;
    mockDb.limit.mockResolvedValueOnce([
      {
        id: 1,
        email: 'test@example.com',
        role: 'client',
        passwordHash: 'hashed-password',
      },
    ]);

    const req = {
      body: { email: 'test@example.com', password: 'password123' },
    } as Request;
    const res = createMockRes();

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalled();
  });

  it('returns user info on me with valid token', async () => {
    const req = {
      user: { userId: 1, email: 'test@example.com', role: 'client' },
    } as any;
    const res = createMockRes();

    await me(req, res);
    expect(res.json).toHaveBeenCalledWith({
      userId: 1,
      email: 'test@example.com',
      role: 'client',
    });
  });

  it('returns 401 on me without user', async () => {
    const req = {} as Request;
    const res = createMockRes();

    await me(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('clears cookies on logout', async () => {
    const req = {} as Request;
    const res = createMockRes();

    await logout(req, res);
    expect(res.clearCookie).toHaveBeenCalledWith('accessToken', {
      path: '/api',
    });
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', {
      path: '/api',
    });
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logged out successfully',
    });
  });
});
