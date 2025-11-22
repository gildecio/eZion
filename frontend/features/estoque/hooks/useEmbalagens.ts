import { useState, useEffect } from 'react';
import { embalagemService } from '../services';
import type { 
  EmbalagemItemWithUnidade, 
  CreateEmbalagemItemDTO, 
  UpdateEmbalagemItemDTO 
} from '../types';

export function useEmbalagens(itemId?: number) {
  const [embalagens, setEmbalagens] = useState<EmbalagemItemWithUnidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmbalagens = async () => {
    if (!itemId) {
      setEmbalagens([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await embalagemService.getByItem(itemId);
      setEmbalagens(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar embalagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmbalagens();
  }, [itemId]);

  const create = async (data: CreateEmbalagemItemDTO): Promise<boolean> => {
    try {
      setError(null);
      await embalagemService.create(data);
      await loadEmbalagens();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar embalagem');
      return false;
    }
  };

  const update = async (id: number, data: UpdateEmbalagemItemDTO): Promise<boolean> => {
    try {
      setError(null);
      await embalagemService.update(id, data);
      await loadEmbalagens();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar embalagem');
      return false;
    }
  };

  const remove = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await embalagemService.delete(id);
      await loadEmbalagens();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir embalagem');
      return false;
    }
  };

  return {
    embalagens,
    loading,
    error,
    create,
    update,
    remove,
    reload: loadEmbalagens
  };
}
