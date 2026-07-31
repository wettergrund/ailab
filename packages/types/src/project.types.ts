import { z } from 'zod';

export const CreateProjectRequestSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  budget: z.number().positive().optional(),
});

export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;

export const UpdateProjectRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
  budget: z.number().positive().optional(),
});

export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;

export const ProjectResponseSchema = z.object({
  id: z.number().int().positive(),
  clientId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  status: z.enum(['active', 'completed', 'archived']),
  budget: z.number().positive().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
