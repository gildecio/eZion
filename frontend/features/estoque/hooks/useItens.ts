import { useState, useEffect } from 'react';
import { itemService } from '@/features/estoque/services';
import type { Item, CreateItemDTO, UpdateItemDTO } from '@/features/estoque/types';

/**
 * Hook para gerenciar itens (CRUD completo)
 */
export function useItens() {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItens();
  }, []);

  const loadItens = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemService.getAll();
      setItens(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: CreateItemDTO): Promise<Item> => {
    try {
      setError(null);
      const item = await itemService.create(data);
      setItens(prev => [...prev, item]);
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
      setItens(prev => prev.map(i => i.id === id ? item : i));
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
      setItens(prev => prev.filter(i => i.id !== id));
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
