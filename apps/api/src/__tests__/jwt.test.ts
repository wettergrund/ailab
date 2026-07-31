import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('jwt utils', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('throws if JWT_SECRET is missing', async () => {
    vi.stubEnv('JWT_SECRET', '');
    vi.stubEnv('REFRESH_SECRET', 'test-refresh-secret');
    await expect(import('../utils/jwt')).rejects.toThrow(
      'JWT_SECRET environment variable is required'
    );
  });

  it('throws if REFRESH_SECRET is missing', async () => {
    vi.stubEnv('JWT_SECRET', 'test-jwt-secret');
    vi.stubEnv('REFRESH_SECRET', '');
    await expect(import('../utils/jwt')).rejects.toThrow(
      'REFRESH_SECRET environment variable is required'
    );
  });

  it('signs and verifies an access token', async () => {
    vi.stubEnv('JWT_SECRET', 'test-jwt-secret');
    vi.stubEnv('REFRESH_SECRET', 'test-refresh-secret');
    const { signAccessToken, verifyAccessToken } = await import('../utils/jwt');
    const payload = { userId: 1, email: 'test@example.com', role: 'client' };
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(1);
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.role).toBe('client');
  });

  it('signs and verifies a refresh token', async () => {
    vi.stubEnv('JWT_SECRET', 'test-jwt-secret');
    vi.stubEnv('REFRESH_SECRET', 'test-refresh-secret');
    const { signRefreshToken, verifyRefreshToken } =
      await import('../utils/jwt');
    const payload = { userId: 1, email: 'test@example.com', role: 'client' };
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(1);
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.role).toBe('client');
  });
});
