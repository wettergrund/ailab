import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  logger('error', err.message, {
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
  });
}
