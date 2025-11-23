import { apiClient } from '@/services/api-client';

import type { Empresa, CreateEmpresaDTO, UpdateEmpresaDTO } from '../types';

export class EmpresaService {
  async getAll(): Promise<Empresa[]> {
    const response = await apiClient.get<Empresa[]>('/contabil/empresas/');
    return response.data;
  }

  async getById(id: number): Promise<Empresa> {
    const response = await apiClient.get<Empresa>(`/contabil/empresas/${id}`);
    return response.data;
  }

  async create(data: CreateEmpresaDTO): Promise<Empresa> {
    const response = await apiClient.post<Empresa>('/contabil/empresas/', data);
    return response.data;
  }

  async update(id: number, data: UpdateEmpresaDTO): Promise<Empresa> {
    const response = await apiClient.put<Empresa>(`/contabil/empresas/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/contabil/empresas/${id}`);
  }
}

export const empresaService = new EmpresaService();
