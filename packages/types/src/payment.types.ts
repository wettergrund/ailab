import { z } from 'zod';

export const CreatePaymentIntentRequestSchema = z.object({
  projectId: z.number().int().positive(),
  amount: z.number().positive(),
});

export type CreatePaymentIntentRequest = z.infer<
  typeof CreatePaymentIntentRequestSchema
>;

export const PaymentIntentResponseSchema = z.object({
  clientSecret: z.string(),
  paymentIntentId: z.string(),
});

export type PaymentIntentResponse = z.infer<typeof PaymentIntentResponseSchema>;

export const PaymentResponseSchema = z.object({
  id: z.number().int().positive(),
  projectId: z.number().int().positive(),
  amount: z.number().positive(),
  status: z.string(),
  stripePaymentIntentId: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
