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

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body as RegisterRequest;
    const result: AuthResponse = await registerUser(data);
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
    res.json(result);
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Refresh failed',
    });
  }
}
