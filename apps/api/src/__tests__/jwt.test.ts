import { describe, it, expect, vi } from 'vitest';

vi.stubEnv('JWT_SECRET', 'test-jwt-secret');
vi.stubEnv('REFRESH_SECRET', 'test-refresh-secret');

describe('jwt utils', () => {
  const payload = { userId: 1, email: 'test@example.com', role: 'client' };

  it('signs and verifies an access token', async () => {
    const { signAccessToken, verifyAccessToken } = await import('../utils/jwt');
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(1);
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.role).toBe('client');
  });

  it('signs and verifies a refresh token', async () => {
    const { signRefreshToken, verifyRefreshToken } =
      await import('../utils/jwt');
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(1);
    expect(decoded.email).toBe('test@example.com');
  });
});
