import { useState, useEffect, useCallback } from 'react';
import { loteService } from '@/features/estoque/services';
import type { Lote, CreateLoteDTO, UpdateLoteDTO } from '@/features/estoque/types';

/**
 * Hook para gerenciar lotes (CRUD completo)
 */
export function useLotes() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasConsulted, setHasConsulted] = useState(false);

  const loadLotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loteService.getAll();
      setLotes(data);
      setHasConsulted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar lotes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLotes();
  }, [loadLotes]);

  const create = async (data: CreateLoteDTO): Promise<Lote | null> => {
    try {
      setError(null);
      const lote = await loteService.create(data);
      await loadLotes();
      return lote;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar lote';
      setError(errorMsg);
      return null;
    }
  };

  const update = async (id: number, data: UpdateLoteDTO): Promise<Lote | null> => {
    try {
      setError(null);
      const lote = await loteService.update(id, data);
      await loadLotes();
      return lote;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar lote';
      setError(errorMsg);
      return null;
    }
  };

  const remove = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await loteService.delete(id);
      await loadLotes();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao excluir lote';
      setError(errorMsg);
      return false;
    }
  };

  const refresh = async () => {
    await loadLotes();
  };

  return {
    lotes,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
  };
}
