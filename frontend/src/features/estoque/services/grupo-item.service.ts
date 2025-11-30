import { apiClient } from '@/services/api-client';
import type { 
  GrupoItem, 
  GrupoItemTree, 
  GrupoItemWithItems,
  CreateGrupoItemDTO, 
  UpdateGrupoItemDTO 
} from '../types/grupo-item';

class GrupoItemService {
  async getAll(): Promise<GrupoItem[]> {
    const response = await apiClient.get<GrupoItem[]>('/api/v1/estoque/grupos/');
    return response.data;
  }

  async getTree(): Promise<GrupoItemTree[]> {
    const response = await apiClient.get<GrupoItemTree[]>('/api/v1/estoque/grupos/tree');
    return response.data;
  }

  async getLeaves(): Promise<GrupoItem[]> {
    const response = await apiClient.get<GrupoItem[]>('/api/v1/estoque/grupos/leaves');
    return response.data;
  }

  async getById(id: number): Promise<GrupoItemWithItems> {
    const response = await apiClient.get<GrupoItemWithItems>(`/api/v1/estoque/grupos/${id}`);
    return response.data;
  }

  async create(data: CreateGrupoItemDTO): Promise<GrupoItem> {
    const response = await apiClient.post<GrupoItem>('/api/v1/estoque/grupos/', data);
    return response.data;
  }

  async update(id: number, data: UpdateGrupoItemDTO): Promise<GrupoItem> {
    const response = await apiClient.put<GrupoItem>(`/api/v1/estoque/grupos/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/api/v1/estoque/grupos/${id}`);
  }
}

export const grupoItemService = new GrupoItemService();
