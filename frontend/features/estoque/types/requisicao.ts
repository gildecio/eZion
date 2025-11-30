export interface RequisicaoFilters {
  item_id?: number;
  data_inicio?: string;
  data_fim?: string;
  local_id?: number;
  status?: StatusRequisicao;
  numero?: number;
  serie?: string;
}
export type StatusRequisicao = 'ABERTA' | 'ATENDIDA' | 'PARCIAL' | 'CANCELADA';

export interface RequisicaoItem {
  id?: number;
  item_id: number;
  quantidade: number;
  atendida?: number;
}

export interface Requisicao {
  id: number;
  solicitante: string;
  data_requisicao: string;
  status: StatusRequisicao;
  observacao?: string;
  itens: RequisicaoItem[];
}

export interface CreateRequisicaoDTO {
  solicitante: string;
  observacao?: string;
  itens: RequisicaoItem[];
}

export interface UpdateRequisicaoDTO {
  solicitante?: string;
  observacao?: string;
  status?: StatusRequisicao;
  itens?: RequisicaoItem[];
}
