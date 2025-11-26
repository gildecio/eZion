import { apiClient } from '@/services/api-client';
import type {
  EmbalagemItem,
  EmbalagemItemWithUnidade,
  CreateItemEmbalagemFromCatalogDTO,
  UpdateItemEmbalagemDTO,
} from '../types/embalagem';

class ItemEmbalagensService {
  async list(itemId: number): Promise<EmbalagemItemWithUnidade[]> {
    const { data } = await apiClient.get<EmbalagemItemWithUnidade[]>(`/estoque/itens/${itemId}/embalagens`);
    return data;
  }

  async createFromCatalog(itemId: number, dto: CreateItemEmbalagemFromCatalogDTO): Promise<EmbalagemItem> {
    const { data } = await apiClient.post<EmbalagemItem>(`/estoque/itens/${itemId}/embalagens/from-catalogo`, dto);
    return data;
  }

  async setDefault(itemId: number, embalagemItemId: number): Promise<EmbalagemItem> {
    const { data } = await apiClient.put<EmbalagemItem>(`/estoque/itens/${itemId}/embalagens/${embalagemItemId}/set-default`, {});
    return data;
  }

  async update(itemId: number, embalagemItemId: number, dto: UpdateItemEmbalagemDTO): Promise<EmbalagemItem> {
    const { data } = await apiClient.put<EmbalagemItem>(`/estoque/itens/${itemId}/embalagens/${embalagemItemId}`, dto);
    return data;
  }

  async delete(itemId: number, embalagemItemId: number): Promise<void> {
    await apiClient.delete<void>(`/estoque/itens/${itemId}/embalagens/${embalagemItemId}`);
  }
}

export const itemEmbalagensService = new ItemEmbalagensService();
