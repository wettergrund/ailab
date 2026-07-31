import { z } from 'zod';

export const CreateBidRequestSchema = z.object({
  proposedHours: z.number().positive(),
  proposedPrice: z.number().positive(),
});

export type CreateBidRequest = z.infer<typeof CreateBidRequestSchema>;

export const BidResponseSchema = z.object({
  id: z.number().int().positive(),
  taskId: z.number().int().positive(),
  workerId: z.number().int().positive(),
  proposedHours: z.number().positive(),
  proposedPrice: z.number().positive(),
  status: z.string(),
  createdAt: z.string().datetime(),
});

export type BidResponse = z.infer<typeof BidResponseSchema>;
