import { Router } from 'express';

const router: Router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
