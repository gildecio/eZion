import { useState, useEffect, useCallback } from 'react';
import { movimentacaoService } from '../services/movimentacao.service';
import type {
  MovimentacaoEstoque,
  CreateMovimentacaoEntradaDTO,
  CreateMovimentacaoSaidaDTO,
  CreateMovimentacaoTransferenciaDTO,
  CreateMovimentacaoAjusteDTO,
  MovimentacaoFilters,
} from '../types/movimentacao';

export function useMovimentacoes(initialFilters?: MovimentacaoFilters) {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovimentacoes = useCallback(async (filters?: MovimentacaoFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await movimentacaoService.getAll(filters);
      setMovimentacoes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar movimentações';
      setError(errorMessage);
      console.error('Erro ao carregar movimentações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarEntrada = useCallback(async (data: CreateMovimentacaoEntradaDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newMovimentacao = await movimentacaoService.registrarEntrada(data);
      setMovimentacoes((prev) => [newMovimentacao, ...prev]);
      return newMovimentacao;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar entrada';
      setError(errorMessage);
      console.error('Erro ao registrar entrada:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarSaida = useCallback(async (data: CreateMovimentacaoSaidaDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newMovimentacao = await movimentacaoService.registrarSaida(data);
      setMovimentacoes((prev) => [newMovimentacao, ...prev]);
      return newMovimentacao;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar saída';
      setError(errorMessage);
      console.error('Erro ao registrar saída:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarTransferencia = useCallback(async (data: CreateMovimentacaoTransferenciaDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newMovimentacao = await movimentacaoService.registrarTransferencia(data);
      setMovimentacoes((prev) => [newMovimentacao, ...prev]);
      return newMovimentacao;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar transferência';
      setError(errorMessage);
      console.error('Erro ao registrar transferência:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarAjuste = useCallback(async (data: CreateMovimentacaoAjusteDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newMovimentacao = await movimentacaoService.registrarAjuste(data);
      setMovimentacoes((prev) => [newMovimentacao, ...prev]);
      return newMovimentacao;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar ajuste';
      setError(errorMessage);
      console.error('Erro ao registrar ajuste:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback((filters?: MovimentacaoFilters) => {
    fetchMovimentacoes(filters);
  }, [fetchMovimentacoes]);

  return {
    movimentacoes,
    loading,
    error,
    registrarEntrada,
    registrarSaida,
    registrarTransferencia,
    registrarAjuste,
    refresh,
  };
}
