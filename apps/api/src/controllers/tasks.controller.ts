import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  getTasks as getTasksSvc,
  getTask as getTaskSvc,
  createTask as createTaskSvc,
  updateTask as updateTaskSvc,
  createBid as createBidSvc,
  getBids as getBidsSvc,
  claimTask as claimTaskSvc,
} from '../services/task.service';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateBidRequest,
} from '@repo/types';

export async function listTasks(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const projectId = req.query.projectId
    ? Number(req.query.projectId)
    : undefined;
  const assigneeId = req.user?.role === 'worker' ? req.user.userId : undefined;
  const tasks = await getTasksSvc(projectId, assigneeId);
  res.json(tasks);
}

export async function createTask(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const data = req.body as CreateTaskRequest;
  const task = await createTaskSvc(data, data.projectId);
  res.status(201).json(task);
}

export async function getTaskById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const task = await getTaskSvc(Number(req.params.id));
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
}

export async function putTask(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const data = req.body as UpdateTaskRequest;
  const task = await updateTaskSvc(Number(req.params.id), data);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
}

export async function createBidForTask(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const data = req.body as CreateBidRequest;
  const bid = await createBidSvc(Number(req.params.id), req.user!.userId, data);
  res.status(201).json(bid);
}

export async function listBidsForTask(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const bids = await getBidsSvc(Number(req.params.id));
  res.json(bids);
}

export async function claimTaskHandler(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const task = await claimTaskSvc(Number(req.params.id), req.user!.userId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
}
