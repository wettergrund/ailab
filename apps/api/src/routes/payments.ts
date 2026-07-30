import { Router } from 'express';
import express from 'express';
import {
  createIntent,
  listPayments,
  webhook,
} from '../controllers/payments.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router: Router = Router();

const createIntentSchema = z.object({
  projectId: z.number().int().positive(),
  amount: z.number().positive(),
});

router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

router.use(authMiddleware);
router.post('/create-intent', validateBody(createIntentSchema), createIntent);
router.get('/', listPayments);

export default router;
