import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TaskResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaymentIntentResponse,
  CreatePaymentIntentRequest,
  PaymentResponse,
  BidResponse,
  CreateBidRequest,
  UserResponse,
} from '@repo/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/api/auth/register', data),
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', data),
  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string }>('/api/auth/refresh', { refreshToken }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get<UserResponse>('/api/auth/me'),
};

export const projectApi = {
  list: () => api.get<ProjectResponse[]>('/api/projects'),
  get: (id: number) => api.get<ProjectResponse>(`/api/projects/${id}`),
  create: (data: CreateProjectRequest) =>
    api.post<ProjectResponse>('/api/projects', data),
  update: (id: number, data: UpdateProjectRequest) =>
    api.put<ProjectResponse>(`/api/projects/${id}`, data),
};

export const taskApi = {
  list: (projectId?: number, assigneeId?: number) => {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', String(projectId));
    if (assigneeId) params.set('assigneeId', String(assigneeId));
    return api.get<TaskResponse[]>(`/api/tasks?${params.toString()}`);
  },
  get: (id: number) => api.get<TaskResponse>(`/api/tasks/${id}`),
  create: (data: CreateTaskRequest) =>
    api.post<TaskResponse>('/api/tasks', data),
  update: (id: number, data: UpdateTaskRequest) =>
    api.put<TaskResponse>(`/api/tasks/${id}`, data),
  claim: (id: number) => api.post(`/api/tasks/${id}/claim`),
  bids: (id: number) => api.get<BidResponse[]>(`/api/tasks/${id}/bids`),
  createBid: (id: number, data: CreateBidRequest) =>
    api.post<BidResponse>(`/api/tasks/${id}/bids`, data),
};

export const paymentApi = {
  createIntent: (data: CreatePaymentIntentRequest) =>
    api.post<PaymentIntentResponse>('/api/payments/create-intent', data),
  list: (projectId?: number) => {
    const params = projectId ? `?projectId=${projectId}` : '';
    return api.get<PaymentResponse[]>(`/api/payments${params}`);
  },
};

export const aiApi = {
  decompose: (taskDescription: string, maxSubtasks?: number) =>
    api.post('/ai/decompose', {
      task_description: taskDescription,
      max_subtasks: maxSubtasks,
    }),
  matchWorker: (requiredSkills: string[], estimatedHours: number) =>
    api.post('/ai/match-worker', {
      required_skills: requiredSkills,
      estimated_hours: estimatedHours,
    }),
};

export default api;
