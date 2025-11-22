from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum


class TipoItem(str, Enum):
    PRODUTO = "Produto"
    PRODUTO_EM_CRIACAO = "Produto em Criação"
    INSUMO = "Insumo"
    IMOBILIZADO = "Imobilizado"
    SERVICO = "Servico"
    EMBALAGEM = "Embalagem"
    OUTROS = "Outros"


class ItemBase(BaseModel):
    descricao: str = Field(..., min_length=1, max_length=255, description="Descrição do item")
    tipo: TipoItem = Field(..., description="Tipo do item")
    grupo_id: int | None = Field(None, description="ID do grupo ao qual o item pertence")


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    descricao: str | None = Field(None, min_length=1, max_length=255)
    tipo: TipoItem | None = None
    grupo_id: int | None = None


class Item(ItemBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
