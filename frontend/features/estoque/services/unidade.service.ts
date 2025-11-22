import { apiClient } from '@/services/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { Unidade, CreateUnidadeDTO, UpdateUnidadeDTO } from '../types';

class UnidadeService {
  async getAll(): Promise<Unidade[]> {
    const response = await apiClient.get<Unidade[]>(API_ENDPOINTS.unidades);
    return response.data;
  }

  async getById(id: number): Promise<Unidade> {
    const response = await apiClient.get<Unidade>(`${API_ENDPOINTS.unidades}${id}`);
    return response.data;
  }

  async create(data: CreateUnidadeDTO): Promise<Unidade> {
    const response = await apiClient.post<Unidade>(API_ENDPOINTS.unidades, data);
    return response.data;
  }

  async update(id: number, data: UpdateUnidadeDTO): Promise<Unidade> {
    const response = await apiClient.put<Unidade>(`${API_ENDPOINTS.unidades}${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.unidades}${id}`);
  }
}

export const unidadeService = new UnidadeService();
