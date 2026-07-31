import { z } from 'zod';

export const SubtaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  estimated_hours: z.number().positive().min(1).max(8),
  required_skills: z.array(z.string()).min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dependencies: z.array(z.string().uuid()).optional().default([]),
  deliverables: z.array(z.string()).optional().default([]),
});

export type Subtask = z.infer<typeof SubtaskSchema>;

export const DecomposeRequestSchema = z.object({
  task_description: z.string().min(10).max(10000),
  context: z.string().max(5000).optional(),
  existing_subtasks: z.array(SubtaskSchema).optional().default([]),
  max_subtasks: z.number().int().positive().max(50).optional().default(20),
  target_hours_per_subtask: z
    .number()
    .positive()
    .min(1)
    .max(8)
    .optional()
    .default(4),
});

export type DecomposeRequest = z.infer<typeof DecomposeRequestSchema>;

export const DecomposeResponseSchema = z.object({
  task_id: z.string().uuid(),
  original_task: z.string(),
  subtasks: z.array(SubtaskSchema),
  total_estimated_hours: z.number().positive(),
  required_skills: z.array(z.string()),
  decomposition_quality: z.enum(['low', 'medium', 'high']),
  notes: z.string().optional(),
});

export type DecomposeResponse = z.infer<typeof DecomposeResponseSchema>;
