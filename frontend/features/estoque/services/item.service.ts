import { apiClient } from '@/services/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { Item, CreateItemDTO, UpdateItemDTO, TipoItem } from '../types';

interface GetAllFilters {
  grupo_id?: number | null;
  tipo?: TipoItem | null;
}

export class ItemService {
  async getAll(filters?: GetAllFilters): Promise<Item[]> {
    let url = API_ENDPOINTS.itens;
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.grupo_id !== undefined && filters.grupo_id !== null) {
        params.append('grupo_id', filters.grupo_id.toString());
      }
      if (filters.tipo) {
        params.append('tipo', filters.tipo);
      }
    }
    
    const queryString = params.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
    
    const response = await apiClient.get<Item[]>(url);
    return response.data;
  }

  async getById(id: number): Promise<Item> {
    const response = await apiClient.get<Item>(`${API_ENDPOINTS.itens}${id}`);
    return response.data;
  }

  async create(data: CreateItemDTO): Promise<Item> {
    const response = await apiClient.post<Item>(API_ENDPOINTS.itens, data);
    return response.data;
  }

  async update(id: number, data: UpdateItemDTO): Promise<Item> {
    const response = await apiClient.put<Item>(`${API_ENDPOINTS.itens}${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.itens}${id}`);
  }
}

export const itemService = new ItemService();
