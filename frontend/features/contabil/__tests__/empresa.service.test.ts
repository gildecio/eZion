import { empresaService } from '../services/empresa.service';
import { apiClient } from '@/services/api-client';
import type { Empresa, CreateEmpresaDTO, UpdateEmpresaDTO } from '../types';

// Mock do apiClient
jest.mock('@/services/api-client');

describe('EmpresaService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('deve retornar lista de empresas', async () => {
      const mockEmpresas: Empresa[] = [
        { id: 1, razao_social: 'Empresa A', cnpj: '12345678000190', ativo: true },
        { id: 2, razao_social: 'Empresa B', cnpj: '98765432000100', ativo: false },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockEmpresas });

      const result = await empresaService.getAll();

      expect(result).toEqual(mockEmpresas);
      expect(mockApiClient.get).toHaveBeenCalledWith('/contabil/empresas/');
    });

    it('deve lançar erro em caso de falha', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(empresaService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('deve retornar uma empresa específica', async () => {
      const mockEmpresa: Empresa = {
        id: 1,
        razao_social: 'Empresa Teste',
        cnpj: '12345678000190',
        ativo: true,
      };

      mockApiClient.get.mockResolvedValue({ data: mockEmpresa });

      const result = await empresaService.getById(1);

      expect(result).toEqual(mockEmpresa);
      expect(mockApiClient.get).toHaveBeenCalledWith('/contabil/empresas/1');
    });
  });

  describe('create', () => {
    it('deve criar uma nova empresa', async () => {
      const newEmpresa: CreateEmpresaDTO = {
        razao_social: 'Nova Empresa',
        cnpj: '12345678000190',
        ativo: true,
      };

      const createdEmpresa: Empresa = {
        id: 1,
        ...newEmpresa,
      };

      mockApiClient.post.mockResolvedValue({ data: createdEmpresa });

      const result = await empresaService.create(newEmpresa);

      expect(result).toEqual(createdEmpresa);
      expect(mockApiClient.post).toHaveBeenCalledWith('/contabil/empresas/', newEmpresa);
    });

    it('deve usar ativo=true como padrão se não informado', async () => {
      const newEmpresa: CreateEmpresaDTO = {
        razao_social: 'Nova Empresa',
        cnpj: '12345678000190',
      };

      const createdEmpresa: Empresa = {
        id: 1,
        razao_social: newEmpresa.razao_social,
        cnpj: newEmpresa.cnpj,
        ativo: true,
      };

      mockApiClient.post.mockResolvedValue({ data: createdEmpresa });

      await empresaService.create(newEmpresa);

      expect(mockApiClient.post).toHaveBeenCalledWith('/contabil/empresas/', newEmpresa);
    });
  });

  describe('update', () => {
    it('deve atualizar uma empresa existente', async () => {
      const updateData: UpdateEmpresaDTO = {
        razao_social: 'Empresa Atualizada',
      };

      const updatedEmpresa: Empresa = {
        id: 1,
        razao_social: 'Empresa Atualizada',
        cnpj: '12345678000190',
        ativo: true,
      };

      mockApiClient.put.mockResolvedValue({ data: updatedEmpresa });

      const result = await empresaService.update(1, updateData);

      expect(result).toEqual(updatedEmpresa);
      expect(mockApiClient.put).toHaveBeenCalledWith('/contabil/empresas/1', updateData);
    });

    it('deve permitir atualização parcial', async () => {
      const updateData: UpdateEmpresaDTO = {
        ativo: false,
      };

      const updatedEmpresa: Empresa = {
        id: 1,
        razao_social: 'Empresa Teste',
        cnpj: '12345678000190',
        ativo: false,
      };

      mockApiClient.put.mockResolvedValue({ data: updatedEmpresa });

      const result = await empresaService.update(1, updateData);

      expect(result).toEqual(updatedEmpresa);
      expect(mockApiClient.put).toHaveBeenCalledWith('/contabil/empresas/1', updateData);
    });
  });

  describe('delete', () => {
    it('deve excluir uma empresa', async () => {
      mockApiClient.delete.mockResolvedValue({ data: null });

      await empresaService.delete(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/contabil/empresas/1');
    });

    it('deve lançar erro se exclusão falhar', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Cannot delete'));

      await expect(empresaService.delete(1)).rejects.toThrow('Cannot delete');
    });
  });
});
