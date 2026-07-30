export interface CreatePaymentIntentRequest {
  projectId: number;
  amount: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentResponse {
  id: number;
  projectId: number;
  amount: string;
  status: string;
  stripePaymentIntentId?: string;
  createdAt: string;
}
