import { useState, useEffect, useCallback } from 'react';
import { documentoService } from '../services/documentoService';
import type { Documento, CreateDocumentoDTO, UpdateDocumentoDTO } from '../types/documento';

export function useDocumentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentos = useCallback(async (params?: {
    empresa_id?: number;
    data_inicio?: string;
    data_fim?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentoService.getAll(params);
      setDocumentos(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar documentos');
      console.error('Erro ao buscar documentos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocumento = useCallback(async (data: CreateDocumentoDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newDocumento = await documentoService.create(data);
      setDocumentos(prev => [...prev, newDocumento]);
      return newDocumento;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar documento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDocumento = useCallback(async (id: number, data: UpdateDocumentoDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await documentoService.update(id, data);
      setDocumentos(prev => prev.map(doc => doc.id === id ? updated : doc));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar documento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocumento = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await documentoService.delete(id);
      setDocumentos(prev => prev.filter(doc => doc.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir documento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    documentos,
    loading,
    error,
    fetchDocumentos,
    createDocumento,
    updateDocumento,
    deleteDocumento,
  };
}
