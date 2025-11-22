export interface SaldoEstoque {
  id: number;
  item_id: number;
  item_codigo?: string;
  item_descricao?: string;
  local_id: number;
  local_codigo?: string;
  local_nome?: string;
  lote_id?: number | null;
  lote_codigo?: string | null;
  quantidade: number;
  custo_medio: number;
  valor_total?: number;
  unidade_padrao_sigla?: string | null;
  ultima_atualizacao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SaldoFilters {
  item_id?: number;
  local_id?: number;
  lote_id?: number;
}
