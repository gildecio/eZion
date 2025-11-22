export interface Empresa {
  id: number;
  razao_social: string;
  cnpj: string;
  ativo: boolean;
}

export interface CreateEmpresaDTO {
  razao_social: string;
  cnpj: string;
  ativo?: boolean;
}

export interface UpdateEmpresaDTO {
  razao_social?: string;
  cnpj?: string;
  ativo?: boolean;
}
