export type TipoSequencia = 'ANUAL' | 'CONTINUO';

export interface Sequencia {
  id: number;
  documento_tipo: string;
  numero: number;
  serie?: string;
  numero_maximo: number;
  tipo: TipoSequencia;
  empresa_id: number;
}

export interface CreateSequenciaDTO {
  documento_tipo: string;
  numero: number;
  serie?: string;
  numero_maximo: number;
  tipo: TipoSequencia;
  empresa_id: number;
}

export interface UpdateSequenciaDTO {
  documento_tipo?: string;
  numero?: number;
  serie?: string;
  numero_maximo?: number;
  tipo?: TipoSequencia;
}
