import axios from 'axios';
import { Project, ApiRequest, ResponseData } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// ============ PROJECT API ============

export const projectApi = {
  getAll: () => api.get<Project[]>('/projects'),
  get: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post<Project>('/projects', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// ============ REQUEST API ============

export const requestApi = {
  getAll: (projectId?: string) =>
    api.get<ApiRequest[]>('/requests', { params: { projectId } }),
  get: (id: string) => api.get<ApiRequest>(`/requests/${id}`),
  create: (data: Partial<ApiRequest>) =>
    api.post<ApiRequest>('/requests', data),
  update: (id: string, data: Partial<ApiRequest>) =>
    api.put<ApiRequest>(`/requests/${id}`, data),
  delete: (id: string) => api.delete(`/requests/${id}`),
  send: (id: string, data: Partial<ApiRequest>) =>
    api.post<{ request: ApiRequest; response: ResponseData }>(`/requests/${id}/send`, data),
  sendOnly: (data: Partial<ApiRequest>) =>
    api.post<ResponseData>('/send', data),
};

export default api;
