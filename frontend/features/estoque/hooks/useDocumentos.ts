import { useState, useEffect } from 'react';
import { documentoService } from '../services/documentoService';
import type { Documento, CreateDocumentoDTO, UpdateDocumentoDTO } from '../types/documento';

export function useDocumentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocumentos = async (params?: {
    empresa_id?: number;
    data_inicio?: string;
    data_fim?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentoService.getAll(params);
      setDocumentos(data);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar documentos');
      console.error('Erro ao buscar documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentos();
  }, []);

  const create = async (data: CreateDocumentoDTO): Promise<boolean> => {
    try {
      setError(null);
      await documentoService.create(data);
      await loadDocumentos();
      return true;
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar documento');
      return false;
    }
  };

  const update = async (id: number, data: UpdateDocumentoDTO): Promise<boolean> => {
    try {
      setError(null);
      await documentoService.update(id, data);
      await loadDocumentos();
      return true;
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar documento');
      return false;
    }
  };

  const remove = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await documentoService.delete(id);
      await loadDocumentos();
      return true;
    } catch (err: any) {
      setError(err?.message || 'Erro ao excluir documento');
      return false;
    }
  };

  return {
    documentos,
    loading,
    error,
    create,
    update,
    remove,
    refresh: loadDocumentos,
  };
}
