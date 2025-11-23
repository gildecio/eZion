import { apiClient } from '@/services/api-client';

import type { 
  EmbalagemItem, 
  EmbalagemItemWithUnidade,
  CreateEmbalagemItemDTO, 
  UpdateEmbalagemItemDTO 
} from '../types';

class EmbalagemService {
  async getByItem(itemId: number): Promise<EmbalagemItemWithUnidade[]> {
    const response = await apiClient.get<EmbalagemItemWithUnidade[]>(
      `/estoque/embalagens/item/${itemId}`
    );
    return response.data;
  }

  async getById(id: number): Promise<EmbalagemItem> {
    const response = await apiClient.get<EmbalagemItem>(`/estoque/embalagens/${id}`);
    return response.data;
  }

  async create(data: CreateEmbalagemItemDTO): Promise<EmbalagemItem> {
    const response = await apiClient.post<EmbalagemItem>('/estoque/embalagens/', data);
    return response.data;
  }

  async update(id: number, data: UpdateEmbalagemItemDTO): Promise<EmbalagemItem> {
    const response = await apiClient.put<EmbalagemItem>(`/estoque/embalagens/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/estoque/embalagens/${id}`);
  }
}

export const embalagemService = new EmbalagemService();
