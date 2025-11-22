import { useState, useEffect, useCallback } from 'react';
import { localService } from '../services/local-service';
import type { Local, LocalCreate, LocalUpdate } from '../types/local';

export function useLocais(apenasAtivos: boolean = false) {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLocais = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await localService.getAll(apenasAtivos);
      setLocais(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar locais');
    } finally {
      setLoading(false);
    }
  }, [apenasAtivos]);

  useEffect(() => {
    loadLocais();
  }, [loadLocais]);

  const create = async (data: LocalCreate): Promise<boolean> => {
    try {
      setError(null);
      await localService.create(data);
      await loadLocais();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar local');
      return false;
    }
  };

  const update = async (id: number, data: LocalUpdate): Promise<boolean> => {
    try {
      setError(null);
      await localService.update(id, data);
      await loadLocais();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar local');
      return false;
    }
  };

  const remove = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await localService.delete(id);
      await loadLocais();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir local');
      return false;
    }
  };

  const refresh = useCallback(() => {
    loadLocais();
  }, [loadLocais]);

  return {
    locais,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
  };
}
