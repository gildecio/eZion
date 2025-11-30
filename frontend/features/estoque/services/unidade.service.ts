import { apiClient } from '@/services/api-client';

import type { Unidade, CreateUnidadeDTO, UpdateUnidadeDTO } from '../types';

class UnidadeService {
  async getAll(): Promise<Unidade[]> {
    const response = await apiClient.get<Unidade[]>('/api/v1/estoque/unidades/');
    return response.data;
  }

  async getById(id: number): Promise<Unidade> {
    const response = await apiClient.get<Unidade>(`/api/v1/estoque/unidades/${id}`);
    return response.data;
  }

  async create(data: CreateUnidadeDTO): Promise<Unidade> {
    const response = await apiClient.post<Unidade>('/api/v1/estoque/unidades/', data);
    return response.data;
  }

  async update(id: number, data: UpdateUnidadeDTO): Promise<Unidade> {
    const response = await apiClient.put<Unidade>(`/api/v1/estoque/unidades/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/estoque/unidades/${id}`);
  }
}

export const unidadeService = new UnidadeService();
