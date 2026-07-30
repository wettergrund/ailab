import { z } from "zod";

export const ComplexityResultSchema = z.object({
  complexity_score: z.number().min(0).max(100),
  difficulty: z.enum(["trivial", "simple", "moderate", "complex", "extremely_complex"]),
  estimated_hours: z.number().positive(),
  required_skill_count: z.number().int().nonnegative(),
  risk_level: z.enum(["low", "medium", "high"]),
  breakdown: z.record(z.string(), z.number()),
});

export type ComplexityResult = z.infer<typeof ComplexityResultSchema>;

export type TaskComplexity = z.infer<typeof ComplexityResultSchema>;