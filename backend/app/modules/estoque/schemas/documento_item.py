from pydantic import BaseModel, Field, field_validator
from typing import Optional
from decimal import Decimal


class DocumentoItemBase(BaseModel):
    quantidade: Decimal = Field(..., gt=0)
    valor_unitario: Decimal = Field(..., ge=0)
    valor_total: Decimal = Field(..., ge=0)
    documento_id: int
    item_id: int
    local_id: int

    @field_validator('quantidade')
    @classmethod
    def quantidade_positiva(cls, v):
        if v <= 0:
            raise ValueError('Quantidade deve ser maior que zero')
        return v

    @field_validator('valor_unitario', 'valor_total')
    @classmethod
    def valores_nao_negativos(cls, v):
        if v < 0:
            raise ValueError('Valores não podem ser negativos')
        return v


class DocumentoItemCreate(DocumentoItemBase):
    pass


class DocumentoItemUpdate(BaseModel):
    quantidade: Optional[Decimal] = Field(None, gt=0)
    valor_unitario: Optional[Decimal] = Field(None, ge=0)
    valor_total: Optional[Decimal] = Field(None, ge=0)
    item_id: Optional[int] = None
    local_id: Optional[int] = None


class DocumentoItem(DocumentoItemBase):
    id: int

    class Config:
        from_attributes = True
