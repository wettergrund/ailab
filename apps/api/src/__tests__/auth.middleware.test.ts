import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextFunction, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

vi.mock('../utils/jwt', () => ({
  verifyAccessToken: vi.fn(),
}));

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts a valid Bearer token', () => {
    const payload = {
      userId: 1,
      email: 'test@example.com',
      role: 'client',
    } as TokenPayload;
    vi.mocked(verifyAccessToken).mockReturnValue(payload);

    const req = {
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as AuthenticatedRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    authMiddleware(req, res, next as NextFunction);
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });

  it('accepts a valid cookie token', () => {
    const payload = {
      userId: 1,
      email: 'test@example.com',
      role: 'client',
    } as TokenPayload;
    vi.mocked(verifyAccessToken).mockReturnValue(payload);

    const req = {
      headers: {},
      cookies: { accessToken: 'valid-token' },
    } as unknown as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn();

    authMiddleware(req, res, next as NextFunction);
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });

  it('rejects missing token', () => {
    const req = {
      headers: {},
      cookies: {},
    } as unknown as AuthenticatedRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    authMiddleware(req, res, {} as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Missing or invalid authorization header',
    });
  });

  it('rejects invalid token', () => {
    vi.mocked(verifyAccessToken).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = {
      headers: { authorization: 'Bearer invalid-token' },
    } as unknown as AuthenticatedRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    authMiddleware(req, res, {} as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid or expired token',
    });
  });
});
