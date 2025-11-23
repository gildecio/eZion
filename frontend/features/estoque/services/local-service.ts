import { apiClient } from '@/services/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { Local, LocalCreate, LocalUpdate } from '../types/local';

const BASE_URL = API_ENDPOINTS.locais;

export const localService = {
  async getAll(apenasAtivos: boolean = false): Promise<Local[]> {
    const params = apenasAtivos ? { apenas_ativos: true } : {};
    const response = await apiClient.get<Local[]>(BASE_URL, { params });
    return response.data;
  },

  async getById(id: number): Promise<Local> {
    const response = await apiClient.get<Local>(`${BASE_URL}${id}`);
    return response.data;
  },

  async create(data: LocalCreate): Promise<Local> {
    const response = await apiClient.post<Local>(BASE_URL, data);
    return response.data;
  },

  async update(id: number, data: LocalUpdate): Promise<Local> {
    const response = await apiClient.put<Local>(`${BASE_URL}${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}${id}`);
  },
};
