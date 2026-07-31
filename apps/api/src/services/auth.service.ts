import bcrypt from 'bcrypt';
import { db } from '@repo/db';
import { users, NewUser } from '@repo/db';
import { eq } from 'drizzle-orm';
import { RegisterRequest, AuthResponse, LoginRequest } from '@repo/types';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt';

const SALT_ROUNDS = 10;

export async function registerUser(
  data: RegisterRequest
): Promise<AuthResponse> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);
  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const newUser: NewUser = {
    email: data.email,
    passwordHash,
    role: data.role ?? 'client',
  };

  const [user] = await db.insert(users).values(newUser).returning();
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: { id: user.id, email: user.email, role: user.role },
  };
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: { id: user.id, email: user.email, role: user.role },
  };
}

export async function refreshTokens(
  refreshToken: string
): Promise<{ accessToken: string }> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    return { accessToken: signAccessToken(payload) };
  } catch {
    throw new Error('Invalid refresh token');
  }
}
