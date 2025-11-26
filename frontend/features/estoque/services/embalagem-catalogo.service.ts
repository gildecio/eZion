import { apiClient } from '@/services/api-client';
import type { EmbalagemCatalogo, CreateEmbalagemCatalogoDTO, UpdateEmbalagemCatalogoDTO } from '../types/embalagem';

class EmbalagemCatalogoService {
  async getAll(): Promise<EmbalagemCatalogo[]> {
    const { data } = await apiClient.get<EmbalagemCatalogo[]>('/estoque/embalagens-catalogo');
    return data;
  }

  async getById(id: number): Promise<EmbalagemCatalogo> {
    const { data } = await apiClient.get<EmbalagemCatalogo>(`/estoque/embalagens-catalogo/${id}`);
    return data;
  }

  async create(dto: CreateEmbalagemCatalogoDTO): Promise<EmbalagemCatalogo> {
    const { data } = await apiClient.post<EmbalagemCatalogo>('/estoque/embalagens-catalogo', dto);
    return data;
  }

  async update(id: number, dto: UpdateEmbalagemCatalogoDTO): Promise<EmbalagemCatalogo> {
    const { data } = await apiClient.put<EmbalagemCatalogo>(`/estoque/embalagens-catalogo/${id}`, dto);
    return data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/estoque/embalagens-catalogo/${id}`);
  }
}

export const embalagemCatalogoService = new EmbalagemCatalogoService();
