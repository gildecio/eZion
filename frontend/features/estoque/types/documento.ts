export interface Documento {
  id: number;
  numero: string;
  tipo_documento: string;
  data_registro: string;
  data_entrada?: string;
  valor: number;
  empresa_id: number;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDocumentoDTO {
  numero: string;
  tipo_documento: string;
  data_registro: string;
  data_entrada?: string;
  valor: number;
  empresa_id: number;
  observacoes?: string;
}

export interface UpdateDocumentoDTO {
  numero?: string;
  tipo_documento?: string;
  data_registro?: string;
  data_entrada?: string;
  valor?: number;
  empresa_id?: number;
  observacoes?: string;
}
