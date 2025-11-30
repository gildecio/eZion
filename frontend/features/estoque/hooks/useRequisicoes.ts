import { useState, useEffect, useCallback } from 'react';
import { requisicaoService } from '../services/requisicao.service';
import type { Requisicao, StatusRequisicao } from '../types/requisicao';
import type { CreateRequisicaoDTO, UpdateRequisicaoDTO } from '../types/requisicao';

export interface RequisicaoFilters {
  item_id?: number;
  data_inicio?: string;
  data_fim?: string;
  local_id?: number;
  status?: StatusRequisicao;
  numero?: number;
  serie?: string;
}

export function useRequisicoes(initialFilters?: RequisicaoFilters) {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequisicoes = useCallback(async (filters?: RequisicaoFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await requisicaoService.getAll(filters);
      setRequisicoes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar requisições';
      setError(errorMessage);
      console.error('Erro ao carregar requisições:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback((filters?: RequisicaoFilters) => {
    fetchRequisicoes(filters);
  }, [fetchRequisicoes]);

  const create = useCallback(async (data: CreateRequisicaoDTO) => {
    setLoading(true);
    setError(null);
    try {
      await requisicaoService.create(data);
      await fetchRequisicoes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar requisição');
    } finally {
      setLoading(false);
    }
  }, [fetchRequisicoes]);

  const update = useCallback(async (id: number, data: UpdateRequisicaoDTO) => {
    setLoading(true);
    setError(null);
    try {
      await requisicaoService.update(id, data);
      await fetchRequisicoes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar requisição');
    } finally {
      setLoading(false);
    }
  }, [fetchRequisicoes]);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await requisicaoService.delete(id);
      await fetchRequisicoes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir requisição');
    } finally {
      setLoading(false);
    }
  }, [fetchRequisicoes]);

  return {
    requisicoes,
    loading,
    error,
    fetchRequisicoes,
    refresh,
    create,
    update,
    remove,
  };
}
