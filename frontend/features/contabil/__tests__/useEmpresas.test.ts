import { renderHook, act, waitFor } from '@testing-library/react';
import { useEmpresas } from '../hooks/useEmpresas';
import { empresaService } from '../services/empresa.service';
import type { Empresa, CreateEmpresaDTO, UpdateEmpresaDTO } from '../types';

// Mock do service
jest.mock('../services/empresa.service');

describe('useEmpresas Hook', () => {
  const mockEmpresaService = empresaService as jest.Mocked<typeof empresaService>;

  const mockEmpresas: Empresa[] = [
    { id: 1, razao_social: 'Empresa A', cnpj: '12345678000190', ativo: true },
    { id: 2, razao_social: 'Empresa B', cnpj: '98765432000100', ativo: false },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('inicialização', () => {
    it('deve carregar empresas ao montar', async () => {
      mockEmpresaService.getAll.mockResolvedValue(mockEmpresas);

      const { result } = renderHook(() => useEmpresas());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.empresas).toEqual(mockEmpresas);
      expect(mockEmpresaService.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erro ao carregar', async () => {
      mockEmpresaService.getAll.mockRejectedValue(new Error('Erro ao carregar'));

      const { result } = renderHook(() => useEmpresas());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Erro ao carregar');
      expect(result.current.empresas).toEqual([]);
    });
  });

  describe('create', () => {
    it('deve criar uma nova empresa', async () => {
      const newEmpresa: CreateEmpresaDTO = {
        razao_social: 'Nova Empresa',
        cnpj: '11111111000111',
        ativo: true,
      };

      const createdEmpresa: Empresa = { id: 3, ...newEmpresa };

      mockEmpresaService.getAll.mockResolvedValue(mockEmpresas);
      mockEmpresaService.create.mockResolvedValue(createdEmpresa);

      const { result } = renderHook(() => useEmpresas());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let returnedEmpresa: Empresa | undefined;

      await act(async () => {
        returnedEmpresa = await result.current.create(newEmpresa);
      });

      expect(returnedEmpresa).toEqual(createdEmpresa);
      expect(result.current.empresas).toHaveLength(3);
      expect(result.current.empresas[2]).toEqual(createdEmpresa);
      expect(mockEmpresaService.create).toHaveBeenCalledWith(newEmpresa);
    });

    it('deve lançar erro ao falhar na criação', async () => {
      const newEmpresa: CreateEmpresaDTO = {
        razao_social: 'Nova Empresa',
        cnpj: '11111111000111',
        ativo: true,
      };

      mockEmpresaService.getAll.mockResolvedValue(mockEmpresas);
      mockEmpresaService.create.mockRejectedValue(new Error('CNPJ duplicado'));

      const { result } = renderHook(() => useEmpresas());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.create(newEmpresa);
        });
      }).rejects.toThrow('CNPJ duplicado');

      expect(result.current.empresas).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('deve atualizar uma empresa existente', async () => {
      const updateData: UpdateEmpresaDTO = {
        razao_social: 'Empresa A Atualizada',
      };

      const updatedEmpresa: Empresa = {
        ...mockEmpresas[0],
        razao_social: 'Empresa A Atualizada',
      };

      mockEmpresaService.getAll.mockResolvedValue(mockEmpresas);
      mockEmpresaService.update.mockResolvedValue(updatedEmpresa);

      const { result } = renderHook(() => useEmpresas());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.update(1, updateData);
      });

      expect(result.current.empresas[0]).toEqual(updatedEmpresa);
      expect(mockEmpresaService.update).toHaveBeenCalledWith(1, updateData);
    });

    it('deve lançar erro ao falhar na atualização', async () => {
      const updateData: UpdateEmpresaDTO = {
        cnpj: '00000000000000',
      };

      mockEmpresaService.getAll.mockResolvedValue(mockEmpresas);
      mockEmpresaService.update.mockRejectedValue(new Error('CNPJ inválido'));

      const { result } = renderHook(() => useEmpresas());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.update(1, updateData);
        });
      }).rejects.toThrow('CNPJ inválido');
    });
  });

  describe('remove', () => {
    it('deve excluir uma empresa', async () => {
      mockEmpresaService.getAll.mockResolvedValue(mockEmpresas);
      mockEmpresaService.delete.mockResolvedValue();

      const { result } = renderHook(() => useEmpresas());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.empresas).toHaveLength(2);

      await act(async () => {
        await result.current.remove(1);
      });

      expect(result.current.empresas).toHaveLength(1);
      expect(result.current.empresas[0].id).toBe(2);
      expect(mockEmpresaService.delete).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro ao falhar na exclusão', async () => {
      mockEmpresaService.getAll.mockResolvedValue(mockEmpresas);
      mockEmpresaService.delete.mockRejectedValue(new Error('Empresa tem dependências'));

      const { result } = renderHook(() => useEmpresas());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.remove(1);
        });
      }).rejects.toThrow('Empresa tem dependências');

      expect(result.current.empresas).toHaveLength(2);
    });
  });

  describe('refresh', () => {
    it('deve recarregar a lista de empresas', async () => {
      const updatedEmpresas: Empresa[] = [
        ...mockEmpresas,
        { id: 3, razao_social: 'Empresa C', cnpj: '33333333000133', ativo: true },
      ];

      mockEmpresaService.getAll
        .mockResolvedValueOnce(mockEmpresas)
        .mockResolvedValueOnce(updatedEmpresas);

      const { result } = renderHook(() => useEmpresas());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.empresas).toHaveLength(2);

      await act(async () => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.empresas).toHaveLength(3);
      });

      expect(mockEmpresaService.getAll).toHaveBeenCalledTimes(2);
    });
  });
});
