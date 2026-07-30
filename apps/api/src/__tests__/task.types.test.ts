import { describe, it, expect } from 'vitest';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskResponse,
} from '../types/task.types';

describe('task types consistency', () => {
  it('has matching estimatedHours types between request and response', () => {
    const createReq: CreateTaskRequest = {
      projectId: 1,
      title: 'Task',
      estimatedHours: 5,
    };
    const taskRes: TaskResponse = {
      id: 1,
      projectId: 1,
      title: 'Task',
      priority: 'medium',
      status: 'open',
      aiGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedHours: createReq.estimatedHours,
    };
    expect(typeof taskRes.estimatedHours).toBe('number');
  });

  it('has matching actualHours types between request and response', () => {
    const updateReq: UpdateTaskRequest = { actualHours: 3 };
    const taskRes: TaskResponse = {
      id: 1,
      projectId: 1,
      title: 'Task',
      priority: 'medium',
      status: 'open',
      aiGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actualHours: updateReq.actualHours,
    };
    expect(typeof taskRes.actualHours).toBe('number');
  });
});
