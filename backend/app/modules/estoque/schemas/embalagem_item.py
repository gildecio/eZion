from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal


# Schemas para EmbalagemItem
class EmbalagemItemBase(BaseModel):
    descricao: str = Field(..., max_length=100, description="Descrição da embalagem")
    unidade_id: int = Field(..., description="ID da unidade de medida")
    fator_conversao: Decimal = Field(..., gt=0, description="Fator de conversão para unidade padrão")
    codigo_barras: Optional[str] = Field(None, max_length=50, description="Código de barras")
    padrao: bool = Field(False, description="Se é a embalagem padrão do item")


class EmbalagemItemCreate(EmbalagemItemBase):
    item_id: int = Field(..., description="ID do item")


class EmbalagemItemUpdate(BaseModel):
    descricao: Optional[str] = Field(None, max_length=100)
    unidade_id: Optional[int] = None
    fator_conversao: Optional[Decimal] = Field(None, gt=0)
    codigo_barras: Optional[str] = Field(None, max_length=50)
    padrao: Optional[bool] = None


class EmbalagemItem(EmbalagemItemBase):
    id: int
    item_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmbalagemItemWithUnidade(EmbalagemItem):
    """Schema com informações da unidade"""
    unidade_sigla: str
    unidade_descricao: str

    class Config:
        from_attributes = True


class EmbalagemItemFromCatalogCreate(BaseModel):
    """Criação de associação usando uma embalagem do catálogo"""
    catalogo_embalagem_id: int = Field(..., description="ID da embalagem no catálogo")
    fator_conversao: Decimal = Field(..., gt=0, description="Fator de conversão para unidade padrão")
    codigo_barras: Optional[str] = Field(None, max_length=50)
    padrao: bool = Field(False)


class EmbalagemItemAssociationUpdate(BaseModel):
    """Atualização de associação item-embalagem (campos mutáveis)."""
    fator_conversao: Optional[Decimal] = Field(None, gt=0)
    codigo_barras: Optional[str] = Field(None, max_length=50)
    padrao: Optional[bool] = None
