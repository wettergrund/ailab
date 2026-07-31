import { z } from 'zod';

export const CreateTaskRequestSchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  estimatedHours: z.number().positive().optional(),
});

export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

export const UpdateTaskRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['open', 'assigned', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assigneeId: z.number().int().positive().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
});

export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;

export const TaskResponseSchema = z.object({
  id: z.number().int().positive(),
  projectId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'assigned', 'in_progress', 'completed']),
  assigneeId: z.number().int().positive().optional(),
  aiGenerated: z.boolean(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TaskResponse = z.infer<typeof TaskResponseSchema>;
