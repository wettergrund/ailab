import { Router } from 'express';
import {
  listProjects,
  createProject,
  getProjectById,
  putProject,
} from '../controllers/projects.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router: Router = Router();

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  budget: z.number().positive().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
  budget: z.number().positive().optional(),
});

router.use(authMiddleware);
router.get('/', listProjects);
router.post('/', validateBody(createProjectSchema), createProject);
router.get('/:id', getProjectById);
router.put('/:id', validateBody(updateProjectSchema), putProject);

export default router;
