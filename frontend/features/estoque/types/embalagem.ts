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

// Catálogo de Embalagens (independente de item)
export interface EmbalagemCatalogo {
  id: number;
  descricao: string;
  unidade_id: number;
  ativo: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateEmbalagemCatalogoDTO {
  descricao: string;
  unidade_id: number;
  ativo?: boolean;
}

export interface UpdateEmbalagemCatalogoDTO {
  descricao?: string;
  unidade_id?: number;
  ativo?: boolean;
}

// Associação de item com embalagem do catálogo
export interface CreateItemEmbalagemFromCatalogDTO {
  catalogo_embalagem_id: number;
  fator_conversao: number;
  codigo_barras?: string | null;
  padrao?: boolean;
}

export interface UpdateItemEmbalagemDTO {
  fator_conversao?: number;
  codigo_barras?: string | null;
  padrao?: boolean;
}
