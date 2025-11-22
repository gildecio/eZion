import { apiClient } from '@/services/api-client';
import type {
  MovimentacaoEstoque,
  CreateMovimentacaoEntradaDTO,
  CreateMovimentacaoSaidaDTO,
  CreateMovimentacaoTransferenciaDTO,
  CreateMovimentacaoAjusteDTO,
  MovimentacaoFilters,
} from '../types/movimentacao';

const BASE_PATH = '/api/v1/estoque/movimentacoes';

export class MovimentacaoService {
  async getAll(filters?: MovimentacaoFilters): Promise<MovimentacaoEstoque[]> {
    const params = new URLSearchParams();
    
    if (filters?.item_id) params.append('item_id', filters.item_id.toString());
    if (filters?.local_id) params.append('local_id', filters.local_id.toString());
    if (filters?.data_inicio) params.append('data_inicio', filters.data_inicio);
    if (filters?.data_fim) params.append('data_fim', filters.data_fim);
    if (filters?.tipo_movimentacao) params.append('tipo_movimentacao', filters.tipo_movimentacao);

    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;
    
    const response = await apiClient.get<MovimentacaoEstoque[]>(url);
    return response.data;
  }

  async getById(id: number): Promise<MovimentacaoEstoque> {
    const response = await apiClient.get<MovimentacaoEstoque>(`${BASE_PATH}/${id}`);
    return response.data;
  }

  async registrarEntrada(data: CreateMovimentacaoEntradaDTO): Promise<MovimentacaoEstoque> {
    const payload = {
      tipo: 'Entrada',
      ...data,
    };
    const response = await apiClient.post<MovimentacaoEstoque>(BASE_PATH, payload);
    return response.data;
  }

  async registrarSaida(data: CreateMovimentacaoSaidaDTO): Promise<MovimentacaoEstoque> {
    const payload = {
      tipo: 'Saida',
      ...data,
    };
    const response = await apiClient.post<MovimentacaoEstoque>(BASE_PATH, payload);
    return response.data;
  }

  async registrarTransferencia(data: CreateMovimentacaoTransferenciaDTO): Promise<MovimentacaoEstoque> {
    const payload = {
      tipo: 'Transferencia',
      ...data,
    };
    const response = await apiClient.post<MovimentacaoEstoque>(BASE_PATH, payload);
    return response.data;
  }

  async registrarAjuste(data: CreateMovimentacaoAjusteDTO): Promise<MovimentacaoEstoque> {
    const response = await apiClient.post<MovimentacaoEstoque>(BASE_PATH, data);
    return response.data;
  }

  async remover(id: number): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  }
}

export const movimentacaoService = new MovimentacaoService();
