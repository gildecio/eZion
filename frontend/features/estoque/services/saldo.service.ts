import { apiClient } from '@/services/api-client';
import type { SaldoEstoque, SaldoFilters } from '../types/saldo';

const BASE_PATH = '/api/v1/estoque/saldos';

export class SaldoService {
  async getAll(filters?: SaldoFilters): Promise<SaldoEstoque[]> {
    const params = new URLSearchParams();
    
    if (filters?.item_id) params.append('item_id', filters.item_id.toString());
    if (filters?.local_id) params.append('local_id', filters.local_id.toString());
    if (filters?.lote_id) params.append('lote_id', filters.lote_id.toString());

    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;
    
    const response = await apiClient.get<SaldoEstoque[]>(url);
    return response.data;
  }

  async getById(id: number): Promise<SaldoEstoque> {
    const response = await apiClient.get<SaldoEstoque>(`${BASE_PATH}/${id}`);
    return response.data;
  }
}

export const saldoService = new SaldoService();
