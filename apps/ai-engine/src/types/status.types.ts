import { z } from 'zod';

export const AIStatusSchema = z.object({
  service: z.literal('ai-engine'),
  version: z.string(),
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  uptime_seconds: z.number().nonnegative(),
  openai_configured: z.boolean(),
  redis_configured: z.boolean(),
  models: z.array(z.string()),
  last_decomposition: z.string().optional(),
  total_decompositions: z.number().nonnegative(),
  total_worker_matches: z.number().nonnegative(),
});

export type AIStatus = z.infer<typeof AIStatusSchema>;
