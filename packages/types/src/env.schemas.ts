import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REFRESH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  AI_ENGINE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  CORS_ORIGIN: z.string().min(1),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_AI_ENGINE_URL: z.string().url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function validateEnv(
  env: Record<string, string | undefined>
): ServerEnv {
  return serverEnvSchema.parse(env);
}

export function validateClientEnv(
  env: Record<string, string | undefined>
): ClientEnv {
  return clientEnvSchema.parse(env);
}
