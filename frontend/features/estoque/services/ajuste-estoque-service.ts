import { apiClient } from '@/services/api-client';
import { 
  AjusteEstoque, 
  CreateAjusteEstoqueDTO, 
  UpdateAjusteEstoqueDTO 
} from '../types/ajuste-estoque';

interface GetAllParams {
  empresa_id?: number;
  skip?: number;
  limit?: number;
}

export const ajusteEstoqueService = {
  async getAll(params?: GetAllParams): Promise<AjusteEstoque[]> {
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
    const url = `/api/v1/estoque/ajustes/${query ? `?${query}` : ''}`;
    
    const response = await apiClient.get<AjusteEstoque[]>(url);
    return response.data;
  },

  async getById(id: number): Promise<AjusteEstoque> {
    const response = await apiClient.get<AjusteEstoque>(`/api/v1/estoque/ajustes/${id}`);
    return response.data;
  },

  async create(data: CreateAjusteEstoqueDTO): Promise<AjusteEstoque> {
    const response = await apiClient.post<AjusteEstoque>('/api/v1/estoque/ajustes/', data);
    return response.data;
  },

  async update(id: number, data: UpdateAjusteEstoqueDTO): Promise<AjusteEstoque> {
    const response = await apiClient.put<AjusteEstoque>(`/api/v1/estoque/ajustes/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/estoque/ajustes/${id}`);
  }
};
