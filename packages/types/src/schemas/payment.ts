import { z } from "zod";
import { BillingStatus, PaymentMethod } from "../enums";

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  amount: z.number().positive(),
  status: z.enum(BillingStatus),
  stripe_payment_intent_id: z.string().optional().nullable(),
  method: z.enum(PaymentMethod).default("card"),
  created_at: z.coerce.date(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const CreatePaymentSchema = PaymentSchema.omit({ id: true, created_at: true, status: true });

export type CreatePayment = z.infer<typeof CreatePaymentSchema>;
