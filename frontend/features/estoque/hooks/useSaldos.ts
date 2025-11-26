import { useState, useEffect, useCallback } from 'react';
import { saldoService } from '../services/saldo.service';
import type { SaldoEstoque, SaldoFilters } from '../types/saldo';
import { parseDecimal } from '../../../utils/formatters';

export function useSaldos() {
  const [saldos, setSaldos] = useState<SaldoEstoque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSaldos = useCallback(async (filters?: SaldoFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await saldoService.getAll(filters);
      setSaldos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar saldos';
      setError(errorMessage);
      console.error('Erro ao carregar saldos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback((filters?: SaldoFilters) => {
    fetchSaldos(filters);
  }, [fetchSaldos]);

  const getTotalValue = useCallback(() => {
    return saldos.reduce((acc, saldo) => {
      const quantidade = parseDecimal(saldo.quantidade);
      const custoMedio = parseDecimal(saldo.custo_medio);
      const valorTotal = parseDecimal(saldo.valor_total);
      const valor = valorTotal || (quantidade * custoMedio);
      return acc + valor;
    }, 0);
  }, [saldos]);

  return {
    saldos,
    loading,
    error,
    refresh,
    fetchSaldos,
    getTotalValue,
  };
}
