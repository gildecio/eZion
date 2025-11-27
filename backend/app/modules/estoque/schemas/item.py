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
    codigo: str = Field(..., min_length=1, max_length=50, description="Código do item")
    codigo_alternativo: str | None = Field(None, max_length=50, description="Código alternativo do item")
    descricao: str = Field(..., min_length=1, max_length=255, description="Descrição do item")
    tipo: TipoItem = Field(..., description="Tipo do item")
    grupo_id: int | None = Field(None, description="ID do grupo ao qual o item pertence")
    unidade_padrao_id: int | None = Field(None, description="ID da unidade padrão do item")
    local_padrao_entrada_id: int = Field(default=0, description="ID do local padrão de entrada")
    local_padrao_saida_id: int = Field(default=0, description="ID do local padrão de saída")


class ItemCreate(BaseModel):
    codigo: str | None = Field(None, max_length=50, description="Código do item (gerado automaticamente se não fornecido)")
    codigo_alternativo: str | None = Field(None, max_length=50, description="Código alternativo (copia do código se não fornecido)")
    descricao: str = Field(..., min_length=1, max_length=255, description="Descrição do item")
    tipo: TipoItem = Field(..., description="Tipo do item")
    grupo_id: int | None = Field(None, description="ID do grupo ao qual o item pertence")
    unidade_padrao_id: int | None = Field(None, description="ID da unidade padrão do item")
    local_padrao_entrada_id: int = Field(default=0, description="ID do local padrão de entrada")
    local_padrao_saida_id: int = Field(default=0, description="ID do local padrão de saída")


class ItemUpdate(BaseModel):
    codigo: str | None = Field(None, min_length=1, max_length=50)
    codigo_alternativo: str | None = Field(None, max_length=50)
    descricao: str | None = Field(None, min_length=1, max_length=255)
    tipo: TipoItem | None = None
    grupo_id: int | None = None
    unidade_padrao_id: int | None = None
    local_padrao_entrada_id: int | None = None
    local_padrao_saida_id: int | None = None


class Item(ItemBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
