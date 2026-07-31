import { z } from 'zod';

export const DecomposeRequestSchema = z.object({
  task_description: z.string().min(10).max(10000),
  context: z.string().max(5000).optional(),
  existing_subtasks: z.array(z.string().uuid()).optional(),
  max_subtasks: z.number().int().positive().max(50).optional(),
  target_hours_per_subtask: z.number().positive().min(1).max(8).optional(),
});

export type DecomposeRequest = z.infer<typeof DecomposeRequestSchema>;

export const MatchWorkerRequestSchema = z.object({
  subtask_id: z.string().uuid(),
  required_skills: z.array(z.string()).min(1),
  estimated_hours: z.number().positive().min(1).max(8),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  max_results: z.number().int().positive().max(20).optional(),
});

export type MatchWorkerRequest = z.infer<typeof MatchWorkerRequestSchema>;
