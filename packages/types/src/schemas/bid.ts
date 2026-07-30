import { z } from "zod";
import { BidStatus } from "../enums";

export const BidSchema = z.object({
  id: z.string().uuid(),
  task_id: z.string().uuid(),
  worker_id: z.string().uuid(),
  proposed_hours: z.number().positive(),
  proposed_price: z.number().nonnegative(),
  status: z.enum(BidStatus),
  created_at: z.coerce.date(),
});

export type Bid = z.infer<typeof BidSchema>;

export const CreateBidSchema = BidSchema.omit({ id: true, created_at: true, status: true });

export type CreateBid = z.infer<typeof CreateBidSchema>;
