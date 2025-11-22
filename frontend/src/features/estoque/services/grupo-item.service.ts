import { apiClient } from '@/services/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { 
  GrupoItem, 
  GrupoItemTree, 
  GrupoItemWithItems,
  CreateGrupoItemDTO, 
  UpdateGrupoItemDTO 
} from '../types/grupo-item';

class GrupoItemService {
  async getAll(): Promise<GrupoItem[]> {
    const response = await apiClient.get<GrupoItem[]>(API_ENDPOINTS.grupos);
    return response.data;
  }

  async getTree(): Promise<GrupoItemTree[]> {
    const response = await apiClient.get<GrupoItemTree[]>(`${API_ENDPOINTS.grupos}tree`);
    return response.data;
  }

  async getLeaves(): Promise<GrupoItem[]> {
    const response = await apiClient.get<GrupoItem[]>(`${API_ENDPOINTS.grupos}leaves`);
    return response.data;
  }

  async getById(id: number): Promise<GrupoItemWithItems> {
    const response = await apiClient.get<GrupoItemWithItems>(`${API_ENDPOINTS.grupos}${id}`);
    return response.data;
  }

  async create(data: CreateGrupoItemDTO): Promise<GrupoItem> {
    const response = await apiClient.post<GrupoItem>(API_ENDPOINTS.grupos, data);
    return response.data;
  }

  async update(id: number, data: UpdateGrupoItemDTO): Promise<GrupoItem> {
    const response = await apiClient.put<GrupoItem>(`${API_ENDPOINTS.grupos}${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`${API_ENDPOINTS.grupos}${id}`);
  }
}

export const grupoItemService = new GrupoItemService();
