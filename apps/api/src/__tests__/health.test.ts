import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

describe('health endpoints', () => {
  let app: ReturnType<typeof express>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        service: 'api',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });
    app.get('/api/health', (_req, res) => {
      res.json({
        status: 'healthy',
        service: 'api',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });
  });

  it('returns healthy status on /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('api');
  });

  it('returns healthy status on /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('api');
  });
});
