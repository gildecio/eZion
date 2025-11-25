// Nota: TipoItem definido em item.ts. Removido aqui para evitar duplicidade de export.

export interface GrupoItem {
  id: number;
  nome: string;
  parent_id: number | null;
  created_at?: string;
  updated_at?: string;
  is_leaf: boolean;
  level: number;
}

export interface GrupoItemTree extends GrupoItem {
  children: GrupoItemTree[];
  path: string[];
}

export interface GrupoItemWithItems extends GrupoItem {
  items_count: number;
}

export interface CreateGrupoItemDTO {
  nome: string;
  parent_id?: number | null;
}

export interface UpdateGrupoItemDTO {
  nome?: string;
  parent_id?: number | null;
}
