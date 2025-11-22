import { apiClient } from '@/services/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { Lote, CreateLoteDTO, UpdateLoteDTO } from '../types';

export class LoteService {
  async getAll(): Promise<Lote[]> {
    const response = await apiClient.get<Lote[]>(API_ENDPOINTS.lotes);
    return response.data;
  }

  async getById(id: number): Promise<Lote> {
    const response = await apiClient.get<Lote>(`${API_ENDPOINTS.lotes}${id}`);
    return response.data;
  }

  async create(data: CreateLoteDTO): Promise<Lote> {
    const response = await apiClient.post<Lote>(API_ENDPOINTS.lotes, data);
    return response.data;
  }

  async update(id: number, data: UpdateLoteDTO): Promise<Lote> {
    const response = await apiClient.put<Lote>(`${API_ENDPOINTS.lotes}${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.lotes}${id}`);
  }
}

export const loteService = new LoteService();
