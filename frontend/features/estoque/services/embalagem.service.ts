import { apiClient } from '@/services/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { 
  EmbalagemItem, 
  EmbalagemItemWithUnidade,
  CreateEmbalagemItemDTO, 
  UpdateEmbalagemItemDTO 
} from '../types';

class EmbalagemService {
  async getByItem(itemId: number): Promise<EmbalagemItemWithUnidade[]> {
    const response = await apiClient.get<EmbalagemItemWithUnidade[]>(
      `${API_ENDPOINTS.embalagens}item/${itemId}`
    );
    return response.data;
  }

  async getById(id: number): Promise<EmbalagemItem> {
    const response = await apiClient.get<EmbalagemItem>(`${API_ENDPOINTS.embalagens}${id}`);
    return response.data;
  }

  async create(data: CreateEmbalagemItemDTO): Promise<EmbalagemItem> {
    const response = await apiClient.post<EmbalagemItem>(API_ENDPOINTS.embalagens, data);
    return response.data;
  }

  async update(id: number, data: UpdateEmbalagemItemDTO): Promise<EmbalagemItem> {
    const response = await apiClient.put<EmbalagemItem>(`${API_ENDPOINTS.embalagens}${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.embalagens}${id}`);
  }
}

export const embalagemService = new EmbalagemService();
