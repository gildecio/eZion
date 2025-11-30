import { apiClient } from '@/services/api-client';

import type { Lote, CreateLoteDTO, UpdateLoteDTO } from '../types';

export class LoteService {
  async getAll(): Promise<Lote[]> {
    const response = await apiClient.get<Lote[]>('/api/v1/estoque/lotes/');
    return response.data;
  }

  async getById(id: number): Promise<Lote> {
    const response = await apiClient.get<Lote>(`/api/v1/estoque/lotes/${id}`);
    return response.data;
  }

  async create(data: CreateLoteDTO): Promise<Lote> {
    const response = await apiClient.post<Lote>('/api/v1/estoque/lotes/', data);
    return response.data;
  }

  async update(id: number, data: UpdateLoteDTO): Promise<Lote> {
    const response = await apiClient.put<Lote>(`/api/v1/estoque/lotes/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/estoque/lotes/${id}`);
  }
}

export const loteService = new LoteService();
