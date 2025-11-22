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
  descricao: string;
  tipo: TipoItem;
  created_at?: string;
  updated_at?: string;
}

export interface CreateItemDTO {
  descricao: string;
  tipo: TipoItem;
}

export interface UpdateItemDTO {
  descricao?: string;
  tipo?: TipoItem;
}
