import type { Documento, CreateDocumentoDTO, UpdateDocumentoDTO } from '../types/documento';

// Stub service until backend endpoints are implemented.
class DocumentoService {
  async getAll(_params?: { empresa_id?: number; data_inicio?: string; data_fim?: string }): Promise<Documento[]> {
    return [];
  }
  async create(_data: CreateDocumentoDTO): Promise<Documento> {
    return {
      id: Date.now(),
      numero: 'STUB',
      tipo_documento: 'Ordem de Produção' as any,
      data_registro: new Date().toISOString(),
      valor: 0,
      empresa_id: _data.empresa_id,
    } as Documento;
  }
  async update(_id: number, _data: UpdateDocumentoDTO): Promise<Documento> {
    return this.create({ numero: 'STUB', tipo_documento: 'Ordem de Produção' as any, data_registro: new Date().toISOString(), valor: 0, empresa_id: _data.empresa_id || 0 });
  }
  async delete(_id: number): Promise<void> {
    return;
  }
}

export const documentoService = new DocumentoService();
