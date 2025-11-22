export enum TipoMovimentacao {
  ENTRADA = 'Entrada',
  SAIDA = 'Saida',
  TRANSFERENCIA = 'Transferencia',
  AJUSTE_POSITIVO = 'Ajuste Positivo',
  AJUSTE_NEGATIVO = 'Ajuste Negativo',
  INVENTARIO = 'Inventario',
  PRODUCAO = 'Producao',
  DEVOLUCAO = 'Devolucao',
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
  local_origem_id?: number;
  local_origem_nome?: string;
  local_destino_id?: number;
  local_destino_nome?: string;
  data_movimentacao: string;
  documento?: string;
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
  local_destino_id: number;
  lote_id?: number;
  quantidade: number;
  custo_unitario: number;
  data_movimentacao?: string;
  documento?: string;
  observacoes?: string;
  usuario?: string;
}

export interface CreateMovimentacaoSaidaDTO {
  item_id: number;
  unidade_id: number;
  local_origem_id: number;
  lote_id?: number;
  quantidade: number;
  custo_unitario?: number;
  data_movimentacao?: string;
  documento?: string;
  observacoes?: string;
  usuario?: string;
}

export interface CreateMovimentacaoTransferenciaDTO {
  item_id: number;
  unidade_id: number;
  local_origem_id: number;
  local_destino_id: number;
  lote_id?: number;
  quantidade: number;
  custo_unitario?: number;
  data_movimentacao?: string;
  documento?: string;
  observacoes?: string;
  usuario?: string;
}

export interface CreateMovimentacaoAjusteDTO {
  tipo: 'Ajuste Positivo' | 'Ajuste Negativo';
  item_id: number;
  unidade_id: number;
  local_destino_id?: number;
  local_origem_id?: number;
  lote_id?: number;
  quantidade: number;
  custo_unitario?: number;
  data_movimentacao?: string;
  documento?: string;
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
