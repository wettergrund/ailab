import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('JWT_SECRET', 'test-jwt-secret');
vi.stubEnv('REFRESH_SECRET', 'test-refresh-secret');

const { signAccessToken, signRefreshToken, verifyRefreshToken } =
  await import('../utils/jwt');

vi.mock('@repo/db', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'client',
    passwordHash: 'hashed-password',
  };
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
  return {
    db: mockDb,
    users: {},
    NewUser: {},
    eq: vi.fn(),
  };
});

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('../utils/jwt', () => ({
  signAccessToken: vi.fn().mockReturnValue('access-token'),
  signRefreshToken: vi.fn().mockReturnValue('refresh-token'),
  verifyRefreshToken: vi
    .fn()
    .mockReturnValue({ userId: 1, email: 'test@example.com', role: 'client' }),
}));

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a new user', async () => {
    const { registerUser } = await import('../services/auth.service');
    const result = await registerUser({
      email: 'new@example.com',
      password: 'password123',
      role: 'client',
    });
    expect(result.user.id).toBe(1);
    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
  });

  it('logs in a user with valid credentials', async () => {
    const { loginUser } = await import('../services/auth.service');
    const mockDb = (await import('@repo/db')).db;
    mockDb.limit.mockResolvedValueOnce([
      {
        id: 1,
        email: 'test@example.com',
        role: 'client',
        passwordHash: 'hashed-password',
      },
    ]);
    const result = await loginUser({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.user.id).toBe(1);
    expect(result.accessToken).toBe('access-token');
  });

  it('refreshes tokens', async () => {
    const { refreshTokens } = await import('../services/auth.service');
    const result = await refreshTokens('valid-refresh-token');
    expect(result.accessToken).toBe('access-token');
  });
});
