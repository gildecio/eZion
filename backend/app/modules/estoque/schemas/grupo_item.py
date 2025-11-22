from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Optional, List


class GrupoItemBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=255, description="Nome do grupo")
    parent_id: Optional[int] = Field(None, description="ID do grupo pai (null para raiz)")


class GrupoItemCreate(GrupoItemBase):
    pass


class GrupoItemUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=1, max_length=255)
    parent_id: Optional[int] = None


class GrupoItem(GrupoItemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_leaf: bool = False
    level: int = 0

    model_config = ConfigDict(from_attributes=True)


class GrupoItemTree(GrupoItem):
    """Grupo com estrutura de árvore"""
    children: List['GrupoItemTree'] = []
    path: List[str] = []  # Caminho completo (nomes dos pais)

    model_config = ConfigDict(from_attributes=True)


class GrupoItemWithItems(GrupoItem):
    """Grupo com lista de itens associados"""
    items_count: int = 0

    model_config = ConfigDict(from_attributes=True)
