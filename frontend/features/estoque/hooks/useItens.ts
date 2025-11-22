import { useState, useEffect, useCallback } from 'react';
import { itemService } from '@/features/estoque/services';
import type { Item, CreateItemDTO, UpdateItemDTO, TipoItem } from '@/features/estoque/types';

interface UseItensFilters {
  grupo_id?: number | null;
  tipo?: TipoItem | null;
}

/**
 * Hook para gerenciar itens (CRUD completo)
 */
export function useItens(filters?: UseItensFilters) {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasConsulted, setHasConsulted] = useState(false);

  const loadItens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemService.getAll(filters);
      setItens(data);
      setHasConsulted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  }, [filters?.grupo_id, filters?.tipo]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      loadItens();
    } else {
      setItens([]);
      setHasConsulted(false);
    }
  }, [filters?.grupo_id, filters?.tipo]);

  const create = async (data: CreateItemDTO): Promise<Item> => {
    try {
      setError(null);
      const item = await itemService.create(data);
      // Recarregar dados para refletir a criação
      if (filters && Object.keys(filters).length > 0) {
        await loadItens();
      }
      return item;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar item';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const update = async (id: number, data: UpdateItemDTO): Promise<Item> => {
    try {
      setError(null);
      const item = await itemService.update(id, data);
      // Recarregar dados para refletir a atualização
      if (filters && Object.keys(filters).length > 0) {
        await loadItens();
      }
      return item;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar item';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const remove = async (id: number): Promise<void> => {
    try {
      setError(null);
      await itemService.delete(id);
      // Recarregar dados para refletir a exclusão
      if (filters && Object.keys(filters).length > 0) {
        await loadItens();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao excluir item';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const refresh = async () => {
    await loadItens();
  };

  return {
    itens,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
  };
}
