export interface CreateTaskRequest {
  projectId: number;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  estimatedHours?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'open' | 'assigned' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  assigneeId?: number;
  estimatedHours?: number;
  actualHours?: number;
}

export interface TaskResponse {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assigneeId?: number;
  aiGenerated: boolean;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}
