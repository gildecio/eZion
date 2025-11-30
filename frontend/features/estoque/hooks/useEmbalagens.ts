import { useState, useEffect } from 'react';
import { itemEmbalagensService } from '../services';
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
      const data = await itemEmbalagensService.list(itemId);
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
      await itemEmbalagensService.createFromCatalog(data.item_id, {
        catalogo_embalagem_id: data.unidade_id, // placeholder (will be updated in component refactor)
        fator_conversao: data.fator_conversao,
        codigo_barras: data.codigo_barras ?? undefined,
        padrao: data.padrao,
      });
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
      // Update only allowed fields in association
      if (!itemId) throw new Error('itemId is required');
      await itemEmbalagensService.update(itemId, id, {
        codigo_barras: data.codigo_barras ?? undefined,
        padrao: data.padrao,
      });
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
      // We need selected itemId to delete association; skip if undefined
      if (!itemId) throw new Error('Item não selecionado');
      await itemEmbalagensService.delete(itemId, id);
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
