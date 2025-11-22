export interface Lote {
  id: number;
  codigo: string;
  data_fabricacao?: string;
  data_validade?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLoteDTO {
  codigo: string;
  data_fabricacao?: string;
  data_validade?: string;
  observacoes?: string;
}

export interface UpdateLoteDTO {
  codigo?: string;
  data_fabricacao?: string;
  data_validade?: string;
  observacoes?: string;
}
