import { db } from '@repo/db';
import { projects, NewProject } from '@repo/db';
import { eq } from 'drizzle-orm';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectResponse,
} from '@repo/types';

export async function getProjects(
  clientId?: number
): Promise<ProjectResponse[]> {
  const conditions = clientId ? eq(projects.clientId, clientId) : undefined;
  const result = await db.select().from(projects).where(conditions);
  return result.map(formatProject);
}

export async function getProject(id: number): Promise<ProjectResponse | null> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return project ? formatProject(project) : null;
}

export async function createProject(
  data: CreateProjectRequest,
  clientId: number
): Promise<ProjectResponse> {
  const values: NewProject = {
    clientId,
    name: data.name,
    description: data.description ?? null,
    status: 'active',
    budget: data.budget ? String(data.budget) : null,
  };
  const [project] = await db.insert(projects).values(values).returning();
  return formatProject(project);
}

export async function updateProject(
  id: number,
  data: UpdateProjectRequest
): Promise<ProjectResponse | null> {
  const [project] = await db
    .update(projects)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.budget !== undefined && { budget: String(data.budget) }),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();
  return project ? formatProject(project) : null;
}

function formatProject(project: typeof projects.$inferSelect): ProjectResponse {
  return {
    id: project.id,
    clientId: project.clientId,
    name: project.name,
    description: project.description ?? undefined,
    status: project.status as 'active' | 'completed' | 'archived',
    budget: project.budget ? Number(project.budget) : undefined,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
