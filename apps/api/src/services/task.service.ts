import { db } from '@repo/db';
import { tasks, bids, NewTask, NewBid } from '@repo/db';
import { eq, and, desc } from 'drizzle-orm';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateBidRequest,
  TaskResponse,
  BidResponse,
} from '@repo/types';

export async function getTasks(
  projectId?: number,
  assigneeId?: number
): Promise<TaskResponse[]> {
  const conditions = [];
  if (projectId !== undefined) conditions.push(eq(tasks.projectId, projectId));
  if (assigneeId !== undefined)
    conditions.push(eq(tasks.assigneeId, assigneeId));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const result = await db
    .select()
    .from(tasks)
    .where(where)
    .orderBy(desc(tasks.createdAt));
  return result.map(formatTask);
}

export async function getTask(id: number): Promise<TaskResponse | null> {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return task ? formatTask(task) : null;
}

export async function createTask(
  data: CreateTaskRequest,
  projectId: number
): Promise<TaskResponse> {
  const values: NewTask = {
    projectId,
    title: data.title,
    description: data.description ?? null,
    priority: data.priority ?? 'medium',
    status: 'open',
    aiGenerated: false,
    estimatedHours: data.estimatedHours ? String(data.estimatedHours) : null,
  };
  const [task] = await db.insert(tasks).values(values).returning();
  return formatTask(task);
}

export async function updateTask(
  id: number,
  data: UpdateTaskRequest
): Promise<TaskResponse | null> {
  const [task] = await db
    .update(tasks)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.estimatedHours !== undefined && {
        estimatedHours: String(data.estimatedHours),
      }),
      ...(data.actualHours !== undefined && {
        actualHours: String(data.actualHours),
      }),
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))
    .returning();
  return task ? formatTask(task) : null;
}

export async function createBid(
  taskId: number,
  workerId: number,
  data: CreateBidRequest
): Promise<BidResponse> {
  const values: NewBid = {
    taskId,
    workerId,
    proposedHours: String(data.proposedHours),
    proposedPrice: String(data.proposedPrice),
    status: 'pending',
  };
  const [bid] = await db.insert(bids).values(values).returning();
  return formatBid(bid);
}

export async function getBids(taskId: number): Promise<BidResponse[]> {
  const result = await db
    .select()
    .from(bids)
    .where(eq(bids.taskId, taskId))
    .orderBy(desc(bids.createdAt));
  return result.map(formatBid);
}

export async function claimTask(
  taskId: number,
  workerId: number
): Promise<TaskResponse | null> {
  const [task] = await db
    .update(tasks)
    .set({ status: 'assigned', assigneeId: workerId, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();
  return task ? formatTask(task) : null;
}

function formatTask(task: typeof tasks.$inferSelect): TaskResponse {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description ?? undefined,
    priority: task.priority as 'low' | 'medium' | 'high',
    status: task.status as 'open' | 'assigned' | 'in_progress' | 'completed',
    assigneeId: task.assigneeId ?? undefined,
    aiGenerated: task.aiGenerated,
    estimatedHours: task.estimatedHours
      ? Number(task.estimatedHours)
      : undefined,
    actualHours: task.actualHours ? Number(task.actualHours) : undefined,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function formatBid(bid: typeof bids.$inferSelect): BidResponse {
  return {
    id: bid.id,
    taskId: bid.taskId,
    workerId: bid.workerId,
    proposedHours: Number(bid.proposedHours),
    proposedPrice: Number(bid.proposedPrice),
    status: bid.status,
    createdAt: bid.createdAt.toISOString(),
  };
}
