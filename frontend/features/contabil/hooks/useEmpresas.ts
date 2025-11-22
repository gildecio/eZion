import { useState, useEffect } from 'react';
import { empresaService } from '@/features/contabil/services';
import type { Empresa, CreateEmpresaDTO, UpdateEmpresaDTO } from '@/features/contabil/types';

/**
 * Hook para gerenciar empresas (CRUD completo)
 */
export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await empresaService.getAll();
      setEmpresas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: CreateEmpresaDTO): Promise<Empresa> => {
    try {
      setError(null);
      const empresa = await empresaService.create(data);
      setEmpresas(prev => [...prev, empresa]);
      return empresa;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar empresa';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const update = async (id: number, data: UpdateEmpresaDTO): Promise<Empresa> => {
    try {
      setError(null);
      const empresa = await empresaService.update(id, data);
      setEmpresas(prev => prev.map(e => e.id === id ? empresa : e));
      return empresa;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar empresa';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const remove = async (id: number): Promise<void> => {
    try {
      setError(null);
      await empresaService.delete(id);
      setEmpresas(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao excluir empresa';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const refresh = () => {
    loadEmpresas();
  };

  return {
    empresas,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
  };
}
