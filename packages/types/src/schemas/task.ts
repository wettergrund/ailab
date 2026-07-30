import { z } from "zod";
import { TaskStatus, TaskPriority } from "../enums";

export const TaskSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(10000).optional(),
  priority: z.enum(TaskPriority),
  status: z.enum(TaskStatus),
  assignee_id: z.string().uuid().optional().nullable(),
  ai_generated: z.boolean().default(false),
  estimated_hours: z.number().positive().optional().nullable(),
  actual_hours: z.number().nonnegative().optional().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskSchema = TaskSchema.omit({ id: true, created_at: true, updated_at: true, status: true });

export type CreateTask = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = TaskSchema.partial().omit({ id: true, project_id: true, created_at: true });

export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
