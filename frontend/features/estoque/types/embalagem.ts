export interface EmbalagemItem {
  id: number;
  item_id: number;
  unidade_id: number;
  descricao: string;
  fator_conversao: string | number;
  codigo_barras?: string | null;
  padrao: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface EmbalagemItemWithUnidade extends EmbalagemItem {
  unidade_sigla: string;
  unidade_descricao: string;
}

export interface CreateEmbalagemItemDTO {
  item_id: number;
  unidade_id: number;
  descricao: string;
  fator_conversao: number;
  codigo_barras?: string;
  padrao?: boolean;
}

export interface UpdateEmbalagemItemDTO {
  descricao?: string;
  unidade_id?: number;
  fator_conversao?: number;
  codigo_barras?: string;
  padrao?: boolean;
}
