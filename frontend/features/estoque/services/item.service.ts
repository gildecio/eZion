import { apiClient } from '@/services/api-client';
import type { Item, CreateItemDTO, UpdateItemDTO, TipoItem } from '../types';

interface GetAllFilters {
  grupo_id?: number | null;
  tipo?: TipoItem | null;
}

export class ItemService {
  async getAll(filters?: GetAllFilters): Promise<Item[]> {
    let url = '/estoque/itens/';
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
    const response = await apiClient.get<Item>(`/estoque/itens/${id}`);
    return response.data;
  }

  async create(data: CreateItemDTO): Promise<Item> {
    const response = await apiClient.post<Item>('/estoque/itens/', data);
    return response.data;
  }

  async update(id: number, data: UpdateItemDTO): Promise<Item> {
    const response = await apiClient.put<Item>(`/estoque/itens/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/estoque/itens/${id}`);
  }
}

export const itemService = new ItemService();
