// Tipos e interfaces para Documentos
export enum TipoDocumento {
  // Entradas
  NF_COMPRA = "Nota Fiscal de Compra",
  NF_DEVOLUCAO_CLIENTE = "Nota Fiscal de Devolução de Cliente",
  TRANSFERENCIA_ENTRADA = "Transferência entre Locais (Entrada)",
  ORDEM_PRODUCAO = "Ordem de Produção",
  AJUSTE_POSITIVO = "Ajuste de Inventário Positivo",
  
  // Saídas
  NF_VENDA = "Nota Fiscal de Venda",
  NF_DEVOLUCAO_FORNECEDOR = "Nota Fiscal de Devolução ao Fornecedor",
  TRANSFERENCIA_SAIDA = "Transferência entre Locais (Saída)",
  REQUISICAO_MATERIAL = "Requisição de Material",
  NOTA_REMESSA = "Nota de Remessa",
  AJUSTE_NEGATIVO = "Ajuste de Inventário Negativo",
  
  // Internos
  ORDEM_SEPARACAO = "Ordem de Separação",
  ORDEM_MONTAGEM = "Ordem de Montagem/Desmontagem"
}

export const TIPO_DOCUMENTO_LABELS: Record<string, string> = {
  "Nota Fiscal de Compra": "01 - Nota Fiscal de Compra",
  "Nota Fiscal de Devolução de Cliente": "02 - Nota Fiscal de Devolução de Cliente",
  "Transferência entre Locais (Entrada)": "03 - Transferência entre Locais (Entrada)",
  "Ordem de Produção": "04 - Ordem de Produção",
  "Ajuste de Inventário Positivo": "05 - Ajuste de Inventário Positivo",
  "Nota Fiscal de Venda": "06 - Nota Fiscal de Venda",
  "Nota Fiscal de Devolução ao Fornecedor": "07 - Nota Fiscal de Devolução ao Fornecedor",
  "Transferência entre Locais (Saída)": "08 - Transferência entre Locais (Saída)",
  "Requisição de Material": "09 - Requisição de Material",
  "Nota de Remessa": "10 - Nota de Remessa",
  "Ajuste de Inventário Negativo": "11 - Ajuste de Inventário Negativo",
  "Ordem de Separação": "12 - Ordem de Separação",
  "Ordem de Montagem/Desmontagem": "13 - Ordem de Montagem/Desmontagem"
};

// Alias para facilitar busca
export const getTipoLabel = (tipo: string) => TIPO_DOCUMENTO_LABELS[tipo] || tipo;

export interface Documento {
  id: number;
  numero: string;
  tipo_documento: TipoDocumento;
  data_registro: string;
  data_entrada?: string;
  valor: number;
  empresa_id: number;
  
  // Campos específicos para Notas Fiscais
  chave_nfe?: string;
  serie?: string;
  modelo?: string;
  cnpj_emissor?: string;
  nome_emissor?: string;
  cnpj_destinatario?: string;
  nome_destinatario?: string;
  
  // Campos para Transferências
  local_origem_id?: number;
  local_destino_id?: number;
  
  // Campos para Ordem de Produção
  lote_producao?: string;
  data_inicio_producao?: string;
  data_fim_producao?: string;
  
  // Campos para Requisição de Material
  centro_custo?: string;
  solicitante?: string;
  ordem_producao_referencia?: string;
  
  // Campos para Ajustes
  motivo_ajuste?: string;
  responsavel_ajuste?: string;
  
  // Campos para Remessa
  data_retorno_prevista?: string;
  destinatario_remessa?: string;
  
  // Campo genérico
  observacoes?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface CreateDocumentoDTO {
  numero: string;
  tipo_documento: TipoDocumento;
  data_registro: string;
  data_entrada?: string;
  valor: number;
  empresa_id: number;
  
  chave_nfe?: string;
  serie?: string;
  modelo?: string;
  cnpj_emissor?: string;
  nome_emissor?: string;
  cnpj_destinatario?: string;
  nome_destinatario?: string;
  local_origem_id?: number;
  local_destino_id?: number;
  lote_producao?: string;
  data_inicio_producao?: string;
  data_fim_producao?: string;
  centro_custo?: string;
  solicitante?: string;
  ordem_producao_referencia?: string;
  motivo_ajuste?: string;
  responsavel_ajuste?: string;
  data_retorno_prevista?: string;
  destinatario_remessa?: string;
  observacoes?: string;
}

export interface UpdateDocumentoDTO {
  numero?: string;
  tipo_documento?: TipoDocumento;
  data_registro?: string;
  data_entrada?: string;
  valor?: number;
  empresa_id?: number;
  
  chave_nfe?: string;
  serie?: string;
  modelo?: string;
  cnpj_emissor?: string;
  nome_emissor?: string;
  cnpj_destinatario?: string;
  nome_destinatario?: string;
  local_origem_id?: number;
  local_destino_id?: number;
  lote_producao?: string;
  data_inicio_producao?: string;
  data_fim_producao?: string;
  centro_custo?: string;
  solicitante?: string;
  ordem_producao_referencia?: string;
  motivo_ajuste?: string;
  responsavel_ajuste?: string;
  data_retorno_prevista?: string;
  destinatario_remessa?: string;
  observacoes?: string;
}

// Configuração de campos por tipo de documento
export interface CampoConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime-local' | 'select';
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
}

export const CAMPOS_POR_TIPO: Record<string, CampoConfig[]> = {
  "Nota Fiscal de Compra": [
    { name: 'chave_nfe', label: 'Chave NFe', type: 'text', maxLength: 44, placeholder: '44 dígitos' },
    { name: 'serie', label: 'Série', type: 'text', maxLength: 10 },
    { name: 'modelo', label: 'Modelo', type: 'text', maxLength: 10, placeholder: '55, 65...' },
    { name: 'cnpj_emissor', label: 'CNPJ Fornecedor', type: 'text', maxLength: 14, required: true },
    { name: 'nome_emissor', label: 'Nome Fornecedor', type: 'text', maxLength: 255, required: true },
  ],
  
  "Nota Fiscal de Venda": [
    { name: 'chave_nfe', label: 'Chave NFe', type: 'text', maxLength: 44 },
    { name: 'serie', label: 'Série', type: 'text', maxLength: 10 },
    { name: 'modelo', label: 'Modelo', type: 'text', maxLength: 10 },
    { name: 'cnpj_destinatario', label: 'CNPJ Cliente', type: 'text', maxLength: 14, required: true },
    { name: 'nome_destinatario', label: 'Nome Cliente', type: 'text', maxLength: 255, required: true },
  ],
  
  "Nota Fiscal de Devolução de Cliente": [
    { name: 'chave_nfe', label: 'Chave NFe Original', type: 'text', maxLength: 44 },
    { name: 'cnpj_emissor', label: 'CNPJ Cliente', type: 'text', maxLength: 14, required: true },
    { name: 'nome_emissor', label: 'Nome Cliente', type: 'text', maxLength: 255 },
    { name: 'motivo_ajuste', label: 'Motivo da Devolução', type: 'text', maxLength: 500, required: true },
  ],
  
  "Nota Fiscal de Devolução ao Fornecedor": [
    { name: 'chave_nfe', label: 'Chave NFe Original', type: 'text', maxLength: 44 },
    { name: 'cnpj_destinatario', label: 'CNPJ Fornecedor', type: 'text', maxLength: 14, required: true },
    { name: 'nome_destinatario', label: 'Nome Fornecedor', type: 'text', maxLength: 255 },
    { name: 'motivo_ajuste', label: 'Motivo da Devolução', type: 'text', maxLength: 500, required: true },
  ],
  
  "Transferência entre Locais (Entrada)": [
    { name: 'local_origem_id', label: 'Local Origem', type: 'select', required: true },
    { name: 'local_destino_id', label: 'Local Destino', type: 'select', required: true },
  ],
  
  "Transferência entre Locais (Saída)": [
    { name: 'local_origem_id', label: 'Local Origem', type: 'select', required: true },
    { name: 'local_destino_id', label: 'Local Destino', type: 'select', required: true },
  ],
  
  "Ordem de Produção": [
    { name: 'lote_producao', label: 'Lote de Produção', type: 'text', maxLength: 50, required: true },
    { name: 'data_inicio_producao', label: 'Data Início', type: 'datetime-local' },
    { name: 'data_fim_producao', label: 'Data Fim', type: 'datetime-local' },
  ],
  
  "Requisição de Material": [
    { name: 'centro_custo', label: 'Centro de Custo', type: 'text', maxLength: 50 },
    { name: 'solicitante', label: 'Solicitante', type: 'text', maxLength: 255, required: true },
    { name: 'ordem_producao_referencia', label: 'OP Referência', type: 'text', maxLength: 50 },
  ],
  
  "Nota de Remessa": [
    { name: 'destinatario_remessa', label: 'Destinatário', type: 'text', maxLength: 255, required: true },
    { name: 'data_retorno_prevista', label: 'Retorno Previsto', type: 'date' },
  ],
  
  "Ajuste de Inventário Positivo": [
    { name: 'motivo_ajuste', label: 'Motivo do Ajuste', type: 'text', maxLength: 500, required: true },
    { name: 'responsavel_ajuste', label: 'Responsável', type: 'text', maxLength: 255, required: true },
  ],
  
  "Ajuste de Inventário Negativo": [
    { name: 'motivo_ajuste', label: 'Motivo do Ajuste', type: 'text', maxLength: 500, required: true },
    { name: 'responsavel_ajuste', label: 'Responsável', type: 'text', maxLength: 255, required: true },
  ],
  
  "Ordem de Separação": [],
  
  "Ordem de Montagem/Desmontagem": [
    { name: 'lote_producao', label: 'Lote', type: 'text', maxLength: 50 },
  ],
};
