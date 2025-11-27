export enum TipoItem {
  PRODUTO = "Produto",
  PRODUTO_EM_CRIACAO = "Produto em Criação",
  INSUMO = "Insumo",
  IMOBILIZADO = "Imobilizado",
  SERVICO = "Servico",
  EMBALAGEM = "Embalagem",
  OUTROS = "Outros"
}

export interface Item {
  id: number;
  codigo: string;
  codigo_alternativo?: string | null;
  descricao: string;
  tipo: TipoItem;
  grupo_id?: number | null;
  unidade_padrao_id?: number | null;
  local_padrao_entrada_id: number;
  local_padrao_saida_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateItemDTO {
  codigo?: string | null;  // Gerado automaticamente se não fornecido
  codigo_alternativo?: string | null;  // Copia do código se não fornecido
  descricao: string;
  tipo: TipoItem;
  grupo_id?: number | null;
  unidade_padrao_id?: number | null;
  local_padrao_entrada_id?: number;
  local_padrao_saida_id?: number;
}

export interface UpdateItemDTO {
  codigo?: string;
  codigo_alternativo?: string | null;
  descricao?: string;
  tipo?: TipoItem;
  grupo_id?: number | null;
  unidade_padrao_id?: number | null;
  local_padrao_entrada_id?: number;
  local_padrao_saida_id?: number;
}
