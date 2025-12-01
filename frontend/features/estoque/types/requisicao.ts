export interface RequisicaoFilters {
  item_id?: number;
  data_inicio?: string;
  data_fim?: string;
  status?: StatusRequisicao;
  numero?: number;
  serie?: string;
}
export type StatusRequisicao = 'ABERTA' | 'ATENDIDA' | 'PARCIAL' | 'CANCELADA';

export interface RequisicaoItem {
  id?: number;
  item_id: number;
  embalagem_id: number;
  quantidade: number;
  atendida?: number;
}

export interface Requisicao {
  id: number;
  numero: string;
  serie?: string;
  solicitante: string;
  data_requisicao: string;
  status: StatusRequisicao;
  local_id?: number;
  itens: RequisicaoItem[];
}

export interface CreateRequisicaoDTO {
  solicitante: string;
  local_id?: number;
  itens: RequisicaoItem[];
}

export interface UpdateRequisicaoDTO {
  solicitante?: string;
  local_id?: number;
  status?: StatusRequisicao;
  itens?: RequisicaoItem[];
}
