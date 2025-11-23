import { apiClient } from '@/services/api-client';
import { Sequencia, CreateSequenciaDTO, UpdateSequenciaDTO } from '../types';

interface GetAllParams {
  empresa_id?: number;
  skip?: number;
  limit?: number;
}

export const sequenciaService = {
  async getAll(params?: GetAllParams): Promise<Sequencia[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.empresa_id) {
      queryParams.append('empresa_id', params.empresa_id.toString());
    }
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const query = queryParams.toString();
    const url = `/configuracoes/sequencias/${query ? `?${query}` : ''}`;
    
    const response = await apiClient.get<Sequencia[]>(url);
    return response.data;
  },

  async getById(id: number): Promise<Sequencia> {
    const response = await apiClient.get<Sequencia>(`/configuracoes/sequencias/${id}`);
    return response.data;
  },

  async create(data: CreateSequenciaDTO): Promise<Sequencia> {
    const response = await apiClient.post<Sequencia>('/configuracoes/sequencias/', data);
    return response.data;
  },

  async update(id: number, data: UpdateSequenciaDTO): Promise<Sequencia> {
    const response = await apiClient.put<Sequencia>(`/configuracoes/sequencias/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/configuracoes/sequencias/${id}`);
  }
};
