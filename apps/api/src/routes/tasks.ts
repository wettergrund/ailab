import { Router } from 'express';
import {
  listTasks,
  createTask,
  getTaskById,
  putTask,
  createBidForTask,
  listBidsForTask,
  claimTaskHandler,
} from '../controllers/tasks.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router: Router = Router();

const createTaskSchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  estimatedHours: z.number().positive().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['open', 'assigned', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assigneeId: z.number().int().positive().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
});

const bidSchema = z.object({
  proposedHours: z.number().positive(),
  proposedPrice: z.number().positive(),
});

router.use(authMiddleware);
router.get('/', listTasks);
router.post('/', validateBody(createTaskSchema), createTask);
router.get('/:id', getTaskById);
router.put('/:id', validateBody(updateTaskSchema), putTask);
router.post('/:id/bids', validateBody(bidSchema), createBidForTask);
router.get('/:id/bids', listBidsForTask);
router.post('/:id/claim', claimTaskHandler);

export default router;
