import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../index';

describe('AI engine health endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns healthy status on /health', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('ai-engine');
  });

  it('returns healthy status on /api/health', async () => {
    const app = createApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('ai-engine');
  });
});
