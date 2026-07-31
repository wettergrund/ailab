import { z } from 'zod';

export const WorkerProfileSchema = z.object({
  worker_id: z.string().uuid(),
  name: z.string(),
  skills: z.array(z.string()),
  experience_level: z.enum(['junior', 'mid', 'senior', 'lead']),
  hourly_rate: z.number().positive(),
  max_hours_per_week: z.number().positive().max(80),
  current_hours_this_week: z.number().min(0).max(80),
  completed_tasks: z.number().int().nonnegative(),
  avg_completion_time_hours: z.number().positive(),
  quality_score: z.number().min(0).max(1),
});

export type WorkerProfile = z.infer<typeof WorkerProfileSchema>;

export const WorkerAvailabilitySchema = z.object({
  worker_id: z.string().uuid(),
  is_available: z.boolean(),
  available_hours: z.number().min(0).max(40),
  next_available_at: z.string().optional(),
  current_task_count: z.number().int().nonnegative(),
  max_concurrent_tasks: z.number().int().positive(),
});

export type WorkerAvailability = z.infer<typeof WorkerAvailabilitySchema>;

export const AssignmentSchema = z.object({
  assignment_id: z.string().uuid(),
  worker_id: z.string().uuid(),
  subtask_id: z.string().uuid(),
  assigned_at: z.string(),
  estimated_completion_at: z.string(),
  confidence_score: z.number().min(0).max(1),
});

export type Assignment = z.infer<typeof AssignmentSchema>;
