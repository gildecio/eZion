import { useState, useEffect } from 'react';
import { unidadeService } from '../services';
import type { Unidade, CreateUnidadeDTO, UpdateUnidadeDTO } from '../types';

export function useUnidades() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUnidades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await unidadeService.getAll();
      setUnidades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar unidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnidades();
  }, []);

  const create = async (data: CreateUnidadeDTO): Promise<boolean> => {
    try {
      setError(null);
      await unidadeService.create(data);
      await loadUnidades();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar unidade');
      return false;
    }
  };

  const update = async (id: number, data: UpdateUnidadeDTO): Promise<boolean> => {
    try {
      setError(null);
      await unidadeService.update(id, data);
      await loadUnidades();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar unidade');
      return false;
    }
  };

  const remove = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await unidadeService.delete(id);
      await loadUnidades();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir unidade');
      return false;
    }
  };

  return {
    unidades,
    loading,
    error,
    create,
    update,
    remove,
    reload: loadUnidades
  };
}
