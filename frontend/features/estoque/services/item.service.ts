import { apiClient } from '@/services/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { Item, CreateItemDTO, UpdateItemDTO } from '../types';

export class ItemService {
  async getAll(): Promise<Item[]> {
    const response = await apiClient.get<Item[]>(API_ENDPOINTS.itens);
    return response.data;
  }

  async getById(id: number): Promise<Item> {
    const response = await apiClient.get<Item>(`${API_ENDPOINTS.itens}/${id}`);
    return response.data;
  }

  async create(data: CreateItemDTO): Promise<Item> {
    const response = await apiClient.post<Item>(API_ENDPOINTS.itens, data);
    return response.data;
  }

  async update(id: number, data: UpdateItemDTO): Promise<Item> {
    const response = await apiClient.put<Item>(`${API_ENDPOINTS.itens}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.itens}/${id}`);
  }
}

export const itemService = new ItemService();
