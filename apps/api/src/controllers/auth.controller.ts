import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  refreshTokens,
} from '../services/auth.service';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshRequest,
} from '@repo/types';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body as RegisterRequest;
    const result: AuthResponse = await registerUser(data);
    res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Registration failed',
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body as LoginRequest;
    const result: AuthResponse = await loginUser(data);
    res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.json(result);
  } catch (error) {
    res
      .status(401)
      .json({ error: error instanceof Error ? error.message : 'Login failed' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as RefreshRequest;
    const result = await refreshTokens(refreshToken);
    res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);
    res.json(result);
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Refresh failed',
    });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('accessToken', { path: '/api' });
  res.clearCookie('refreshToken', { path: '/api' });
  res.json({ message: 'Logged out successfully' });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = (
    req as { user?: { userId: number; email: string; role: string } }
  ).user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json({ userId: user.userId, email: user.email, role: user.role });
}
