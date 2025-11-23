export interface AjusteEstoqueItem {
  id: number;
  ajuste_id: number;
  item_id: number;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  lote_id?: number;
  local_id?: number;
  observacao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAjusteEstoqueItemDTO {
  item_id: number;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  lote_id?: number;
  local_id?: number;
  observacao?: string;
}

export interface AjusteEstoque {
  id: number;
  numero: string;
  data_entrada: string;
  data_registro: string;
  tipo: 'E' | 'S';
  valor: number;
  empresa_id: number;
  itens: AjusteEstoqueItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateAjusteEstoqueDTO {
  numero: string;
  data_entrada: string;
  data_registro: string;
  tipo: 'E' | 'S';
  valor: number;
  empresa_id: number;
  itens: CreateAjusteEstoqueItemDTO[];
}

export interface UpdateAjusteEstoqueDTO {
  numero?: string;
  data_entrada?: string;
  data_registro?: string;
  tipo?: 'E' | 'S';
  valor?: number;
  itens?: CreateAjusteEstoqueItemDTO[];
}

export const TIPO_AJUSTE = {
  E: 'Entrada',
  S: 'Saída'
} as const;
