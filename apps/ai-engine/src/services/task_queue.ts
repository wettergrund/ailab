import { QueueService } from './queue.service';
import { OpenAIService } from './openai.service';
import { DecomposeRequest } from '../types/decompose.types';
import { MatchWorkerRequest } from '../types/dispatch.types';

export type TaskHandler = (payload: unknown) => Promise<unknown>;

export interface TaskQueueEntry {
  id: string;
  type: 'decompose' | 'match_worker' | 'health_check';
  payload: unknown;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  result?: unknown;
  error?: string;
}

export class TaskQueue {
  private queue: QueueService;
  private openai: OpenAIService;
  private handlers: Map<string, TaskHandler>;
  private tasks: Map<string, TaskQueueEntry>;

  constructor(queue: QueueService, openai: OpenAIService) {
    this.queue = queue;
    this.openai = openai;
    this.handlers = new Map();
    this.tasks = new Map();

    this.registerHandlers();
  }

  async submitDecompose(request: DecomposeRequest): Promise<string> {
    const taskId = `decompose_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry: TaskQueueEntry = {
      id: taskId,
      type: 'decompose',
      payload: request,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    this.tasks.set(taskId, entry);
    await this.queue.enqueue({
      type: 'decompose',
      payload: request,
      priority: 1,
      max_attempts: 3,
    });

    return taskId;
  }

  async submitMatchWorker(request: MatchWorkerRequest): Promise<string> {
    const taskId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry: TaskQueueEntry = {
      id: taskId,
      type: 'match_worker',
      payload: request,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    this.tasks.set(taskId, entry);
    await this.queue.enqueue({
      type: 'match_worker',
      payload: request,
      priority: 2,
      max_attempts: 3,
    });

    return taskId;
  }

  async getTaskStatus(taskId: string): Promise<TaskQueueEntry | undefined> {
    return this.tasks.get(taskId);
  }

  async processNext(): Promise<void> {
    const message = await this.queue.dequeue('ai_engine');
    if (!message) return;

    const entry = this.tasks.get(message.id);
    if (!entry) return;

    entry.status = 'processing';

    try {
      const handler = this.handlers.get(message.type);
      if (!handler) {
        throw new Error(`No handler registered for task type: ${message.type}`);
      }

      const result = await handler(message.payload);
      entry.status = 'completed';
      entry.result = result;
      entry.completed_at = new Date().toISOString();

      await this.queue.acknowledge(message.id);
    } catch (error) {
      entry.status = 'failed';
      entry.error = error instanceof Error ? error.message : String(error);

      await this.queue.nack(message.id, true);
    }
  }

  private registerHandlers(): void {
    this.handlers.set('decompose', async (payload: unknown) => {
      const request = payload as DecomposeRequest;
      return this.openai.decomposeTask(request);
    });

    this.handlers.set('match_worker', async (payload: unknown) => {
      return payload;
    });
  }
}
