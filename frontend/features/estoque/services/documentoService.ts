import { apiClient } from '@/services/api-client';
import type { Documento, CreateDocumentoDTO, UpdateDocumentoDTO } from '../types/documento';

const BASE_URL = '/estoque/documentos/';

export class DocumentoService {
  async getAll(params?: {
    skip?: number;
    limit?: number;
    empresa_id?: number;
    data_inicio?: string;
    data_fim?: string;
  }): Promise<Documento[]> {
    let url = BASE_URL;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }
    const response = await apiClient.get<Documento[]>(url);
    return response.data;
  }

  async getById(id: number): Promise<Documento> {
    const response = await apiClient.get<Documento>(`${BASE_URL}${id}`);
    return response.data;
  }

  async create(data: CreateDocumentoDTO): Promise<Documento> {
    const response = await apiClient.post<Documento>(BASE_URL, data);
    return response.data;
  }

  async update(id: number, data: UpdateDocumentoDTO): Promise<Documento> {
    const response = await apiClient.put<Documento>(`${BASE_URL}${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}${id}`);
  }
}

export const documentoService = new DocumentoService();
