import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  createProject as createProjectSvc,
  getProjects as getProjectsSvc,
  getProject as getProjectSvc,
  updateProject as updateProjectSvc,
} from '../services/project.service';
import { CreateProjectRequest, UpdateProjectRequest } from '@repo/types';

export async function listProjects(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const clientId = req.user?.role === 'admin' ? undefined : req.user?.userId;
  const projects = await getProjectsSvc(clientId);
  res.json(projects);
}

export async function createProject(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const data = req.body as CreateProjectRequest;
  const project = await createProjectSvc(data, req.user!.userId);
  res.status(201).json(project);
}

export async function getProjectById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const project = await getProjectSvc(Number(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(project);
}

export async function putProject(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const data = req.body as UpdateProjectRequest;
  const project = await updateProjectSvc(Number(req.params.id), data);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(project);
}
