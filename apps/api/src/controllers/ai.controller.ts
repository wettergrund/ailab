import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  decomposeTask as decomposeTaskSvc,
  matchWorker as matchWorkerSvc,
} from '../services/ai.service';

export async function aiDecompose(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const result = await decomposeTaskSvc(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'AI decompose failed',
    });
  }
}

export async function aiMatchWorker(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const result = await matchWorkerSvc(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'AI match-worker failed',
    });
  }
}
