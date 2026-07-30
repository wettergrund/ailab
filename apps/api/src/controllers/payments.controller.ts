import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  createPaymentIntent,
  getPayments,
  handleStripeWebhook,
} from '../services/billing.service';
import { CreatePaymentIntentRequest } from '@repo/types';

export async function createIntent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const data = req.body as CreatePaymentIntentRequest;
  const result = await createPaymentIntent(data);
  res.status(201).json(result);
}

export async function listPayments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const projectId = req.query.projectId
    ? Number(req.query.projectId)
    : undefined;
  const payments = await getPayments(projectId);
  res.json(payments);
}

export async function webhook(req: Request, res: Response): Promise<void> {
  const event = req.body;
  try {
    await handleStripeWebhook(event);
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Webhook failed',
    });
  }
}
