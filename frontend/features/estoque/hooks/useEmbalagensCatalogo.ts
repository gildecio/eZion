import { useState, useEffect } from 'react';
import { embalagemCatalogoService } from '../services';
import type { EmbalagemCatalogo, CreateEmbalagemCatalogoDTO, UpdateEmbalagemCatalogoDTO } from '../types/embalagem';

export function useEmbalagensCatalogo() {
  const [embalagens, setEmbalagens] = useState<EmbalagemCatalogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await embalagemCatalogoService.getAll();
      setEmbalagens(data);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar embalagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (dto: CreateEmbalagemCatalogoDTO): Promise<boolean> => {
    try {
      setError(null);
      await embalagemCatalogoService.create(dto);
      await load();
      return true;
    } catch (e: any) {
      setError(e?.message || 'Erro ao criar embalagem');
      return false;
    }
  };

  const update = async (id: number, dto: UpdateEmbalagemCatalogoDTO): Promise<boolean> => {
    try {
      setError(null);
      await embalagemCatalogoService.update(id, dto);
      await load();
      return true;
    } catch (e: any) {
      setError(e?.message || 'Erro ao atualizar embalagem');
      return false;
    }
  };

  const remove = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await embalagemCatalogoService.delete(id);
      await load();
      return true;
    } catch (e: any) {
      setError(e?.message || 'Erro ao excluir embalagem');
      return false;
    }
  };

  return { embalagens, loading, error, create, update, remove, reload: load };
}
