import { z } from "zod";
import { ProjectStatus } from "../enums";

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  status: z.enum(ProjectStatus),
  budget: z.number().nonnegative(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectSchema = ProjectSchema.omit({ id: true, created_at: true, updated_at: true });

export type CreateProject = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = ProjectSchema.partial().omit({ id: true, client_id: true, created_at: true });

export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
