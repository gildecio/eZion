export enum TipoMovimentacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  AJUSTE_ENTRADA = 'AJUSTE_ENTRADA',
  AJUSTE_SAIDA = 'AJUSTE_SAIDA',
  INVENTARIO = 'INVENTARIO',
  PRODUCAO = 'PRODUCAO',
  DEVOLUCAO = 'DEVOLUCAO',
}

export interface MovimentacaoEstoque {
  id: number;
  tipo: string;
  item_id: number;
  item_codigo?: string;
  item_nome?: string;
  quantidade: number;
  unidade_id: number;
  unidade_sigla?: string;
  lote_id?: number;
  lote_codigo?: string;
  local_id?: number;
  local_nome?: string;
  data_movimentacao: string;
  numero?: string;
  serie?: string;
  observacoes?: string;
  custo_unitario?: number;
  saldo_anterior?: number;
  saldo_atual?: number;
  usuario?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateMovimentacaoEntradaDTO {
  item_id: number;
  unidade_id: number;
  local_id: number;
  lote_id?: number;
  quantidade: number;
  custo_unitario: number;
  data_movimentacao?: string;
  numero?: string;
  serie?: string;
  observacoes?: string;
  usuario?: string;
}

export interface CreateMovimentacaoSaidaDTO {
  item_id: number;
  unidade_id: number;
  local_id: number;
  lote_id?: number;
  quantidade: number;
  custo_unitario?: number;
  data_movimentacao?: string;
  numero?: string;
  serie?: string;
  observacoes?: string;
  usuario?: string;
}

// Transferência removida do backend (mantido para compatibilidade caso necessário)
export interface CreateMovimentacaoTransferenciaDTO {
  item_id: number;
  unidade_id: number;
  local_id: number; // Representa o local da movimentação
  lote_id?: number;
  quantidade: number;
  custo_unitario?: number;
  data_movimentacao?: string;
  numero?: string;
  serie?: string;
  observacoes?: string;
  usuario?: string;
}

export interface CreateMovimentacaoAjusteDTO {
  tipo: 'AJUSTE_ENTRADA' | 'AJUSTE_SAIDA';
  item_id: number;
  unidade_id: number;
  local_id: number;
  lote_id?: number;
  quantidade: number;
  custo_unitario?: number;
  data_movimentacao?: string;
  numero?: string;
  serie?: string;
  observacoes?: string;
  usuario?: string;
}

export interface MovimentacaoFilters {
  item_id?: number;
  local_id?: number;
  data_inicio?: string;
  data_fim?: string;
  tipo_movimentacao?: TipoMovimentacao;
}
