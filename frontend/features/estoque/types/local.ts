export interface Local {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface LocalCreate {
  codigo: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface LocalUpdate {
  codigo?: string;
  nome?: string;
  descricao?: string;
  ativo?: boolean;
}
