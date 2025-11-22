export enum TipoMedida {
  QUANTIDADE = "Quantidade",
  PESO = "Peso",
  VOLUME = "Volume",
  COMPRIMENTO = "Comprimento",
  AREA = "Area",
  OUTROS = "Outros"
}

export interface Unidade {
  id: number;
  sigla: string;
  descricao: string;
  tipo_medida: TipoMedida;
  created_at: string;
  updated_at?: string;
}

export interface CreateUnidadeDTO {
  sigla: string;
  descricao: string;
  tipo_medida: TipoMedida;
}

export interface UpdateUnidadeDTO {
  sigla?: string;
  descricao?: string;
  tipo_medida?: TipoMedida;
}
