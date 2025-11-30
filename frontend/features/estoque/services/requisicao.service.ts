import { apiClient } from '@/services/api-client';
import { Requisicao, CreateRequisicaoDTO, UpdateRequisicaoDTO } from '../types/requisicao';

export const requisicaoService = {
  async getAll(filters?: Record<string, any>): Promise<Requisicao[]> {
    let url = '/api/v1/estoque/requisicao/';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.numero) params.append('numero', filters.numero);
      if (filters.serie) params.append('serie', filters.serie);
      if (filters.local_id) params.append('local_id', filters.local_id);
      if (filters.data_inicio) params.append('data_inicio', filters.data_inicio);
      if (filters.data_fim) params.append('data_fim', filters.data_fim);
      if (filters.status) params.append('status', filters.status);
      url += `?${params.toString()}`;
    }
    const response = await apiClient.get<Requisicao[]>(url);
    return response.data;
  },
  async getById(id: number): Promise<Requisicao> {
    const response = await apiClient.get<Requisicao>(`/api/v1/estoque/requisicao/${id}`);
    return response.data;
  },
  async create(data: CreateRequisicaoDTO): Promise<Requisicao> {
    const response = await apiClient.post<Requisicao>('/api/v1/estoque/requisicao/', data);
    return response.data;
  },
  async update(id: number, data: UpdateRequisicaoDTO): Promise<Requisicao> {
    const response = await apiClient.put<Requisicao>(`/api/v1/estoque/requisicao/${id}`, data);
    return response.data;
  },
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/estoque/requisicao/${id}`);
  },
};
