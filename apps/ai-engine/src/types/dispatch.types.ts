import { z } from "zod";

export const WorkerSuggestionSchema = z.object({
  worker_id: z.string().uuid(),
  name: z.string(),
  skills: z.array(z.string()),
  match_score: z.number().min(0).max(1),
  estimated_hours: z.number().positive(),
  availability_status: z.enum(["available", "busy", "unavailable"]),
  current_load: z.number().min(0).max(100),
  reason: z.string().optional(),
});

export type WorkerSuggestion = z.infer<typeof WorkerSuggestionSchema>;

export const MatchWorkerRequestSchema = z.object({
  subtask_id: z.string().uuid(),
  required_skills: z.array(z.string()).min(1),
  estimated_hours: z.number().positive().min(1).max(8),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  max_results: z.number().int().positive().max(20).optional().default(5),
});

export type MatchWorkerRequest = z.infer<typeof MatchWorkerRequestSchema>;

export const MatchWorkerResponseSchema = z.object({
  subtask_id: z.string().uuid(),
  suggestions: z.array(WorkerSuggestionSchema),
  total_candidates: z.number().int().nonnegative(),
  match_strategy: z.string(),
});

export type MatchWorkerResponse = z.infer<typeof MatchWorkerResponseSchema>;