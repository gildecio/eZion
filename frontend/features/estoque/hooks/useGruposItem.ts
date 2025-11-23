import { useState, useEffect } from 'react';
import { grupoItemService } from '../services/grupo-item.service';
import type { 
  GrupoItem, 
  GrupoItemTree, 
  CreateGrupoItemDTO, 
  UpdateGrupoItemDTO 
} from '../types/grupo-item';

export const useGruposItem = () => {
  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [tree, setTree] = useState<GrupoItemTree[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGrupos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await grupoItemService.getAll();
      setGrupos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const loadTree = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[useGruposItem] Carregando árvore...');
      const data = await grupoItemService.getTree();
      console.log('[useGruposItem] Árvore carregada:', data);
      setTree(data);
    } catch (err) {
      console.error('[useGruposItem] Erro ao carregar árvore:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar árvore de grupos');
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: CreateGrupoItemDTO): Promise<GrupoItem | null> => {
    setLoading(true);
    setError(null);
    try {
      const newGrupo = await grupoItemService.create(data);
      await loadGrupos();
      await loadTree();
      return newGrupo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar grupo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: number, data: UpdateGrupoItemDTO): Promise<GrupoItem | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedGrupo = await grupoItemService.update(id, data);
      await loadGrupos();
      await loadTree();
      return updatedGrupo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar grupo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await grupoItemService.delete(id);
      await loadGrupos();
      await loadTree();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir grupo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrupos();
    loadTree();
  }, []);

  return {
    grupos,
    tree,
    loading,
    error,
    create,
    update,
    remove,
    refresh: () => {
      loadGrupos();
      loadTree();
    }
  };
};
