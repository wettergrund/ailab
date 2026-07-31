import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('stripe utils', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('throws if STRIPE_SECRET_KEY is missing', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    await expect(import('../utils/stripe')).rejects.toThrow(
      'STRIPE_SECRET_KEY environment variable is required'
    );
  });

  it('returns a Stripe instance when key is present', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    const { stripe } = await import('../utils/stripe');
    expect(stripe).toBeDefined();
  });
});
