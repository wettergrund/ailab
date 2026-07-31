export interface CreateProjectRequest {
  name: string;
  description?: string;
  budget?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
  budget?: number;
}

export interface ProjectResponse {
  id: number;
  clientId: number;
  name: string;
  description?: string;
  status: string;
  budget?: string;
  createdAt: string;
  updatedAt: string;
}
