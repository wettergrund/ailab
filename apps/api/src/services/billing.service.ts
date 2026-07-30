import { db } from '@repo/db';
import { payments, NewPayment, projects } from '@repo/db';
import { eq, sql } from 'drizzle-orm';
import { CreatePaymentIntentRequest, PaymentIntentResponse } from '@repo/types';
import { stripe } from '../utils/stripe';

export async function createPaymentIntent(
  data: CreatePaymentIntentRequest
): Promise<PaymentIntentResponse> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, data.projectId))
    .limit(1);
  if (!project) {
    throw new Error('Project not found');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(data.amount * 100),
    currency: 'usd',
    metadata: { projectId: String(data.projectId) },
  });

  const values: NewPayment = {
    projectId: data.projectId,
    amount: String(data.amount),
    status: 'pending',
    stripePaymentIntentId: paymentIntent.id,
  };
  await db.insert(payments).values(values);

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

export async function handleStripeWebhook(
  eventBody: string | Buffer,
  signatureHeader: string,
  endpointSecret: string
): Promise<void> {
  const event = stripe.webhooks.constructEvent(
    eventBody,
    signatureHeader,
    endpointSecret
  );
  const intent = (event as { data: { object: { id: string; status: string } } })
    .data.object;
  const status = intent.status === 'succeeded' ? 'succeeded' : 'failed';

  await db
    .update(payments)
    .set({ status })
    .where(eq(payments.stripePaymentIntentId, intent.id));
}

export async function getPayments(projectId?: number): Promise<any[]> {
  const where =
    projectId !== undefined ? eq(payments.projectId, projectId) : undefined;
  const result = await db
    .select()
    .from(payments)
    .where(where)
    .orderBy(sql`${payments.createdAt} DESC`);
  return result.map((p) => ({
    id: p.id,
    projectId: p.projectId,
    amount: p.amount,
    status: p.status,
    stripePaymentIntentId: p.stripePaymentIntentId ?? undefined,
    createdAt: p.createdAt.toISOString(),
  }));
}
