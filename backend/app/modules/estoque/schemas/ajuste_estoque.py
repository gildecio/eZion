from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date
from decimal import Decimal

class AjusteEstoqueItemBase(BaseModel):
    item_id: int
    quantidade: Decimal = Field(..., gt=0)
    valor_unitario: Decimal = Field(..., ge=0)
    valor_total: Decimal = Field(..., ge=0)
    lote_id: Optional[int] = None
    local_id: Optional[int] = None
    observacao: Optional[str] = Field(None, max_length=500)

class AjusteEstoqueItemCreate(AjusteEstoqueItemBase):
    pass

class AjusteEstoqueItemUpdate(AjusteEstoqueItemBase):
    item_id: Optional[int] = None
    quantidade: Optional[Decimal] = None
    valor_unitario: Optional[Decimal] = None
    valor_total: Optional[Decimal] = None

class AjusteEstoqueItemInDB(AjusteEstoqueItemBase):
    id: int
    ajuste_id: int
    
    class Config:
        from_attributes = True

class AjusteEstoqueBase(BaseModel):
    numero: str = Field(..., max_length=50)
    data_entrada: date
    data_registro: date
    tipo: str = Field(..., pattern="^(E|S)$")
    valor: Decimal = Field(..., ge=0)

    @validator('tipo')
    def validate_tipo(cls, v):
        if v not in ['E', 'S']:
            raise ValueError('Tipo deve ser E (Entrada) ou S (Saída)')
        return v

class AjusteEstoqueCreate(AjusteEstoqueBase):
    empresa_id: int
    itens: List[AjusteEstoqueItemCreate] = []

class AjusteEstoqueUpdate(BaseModel):
    numero: Optional[str] = Field(None, max_length=50)
    data_entrada: Optional[date] = None
    data_registro: Optional[date] = None
    tipo: Optional[str] = Field(None, pattern="^(E|S)$")
    valor: Optional[Decimal] = None
    itens: Optional[List[AjusteEstoqueItemCreate]] = None

    @validator('tipo')
    def validate_tipo(cls, v):
        if v is not None and v not in ['E', 'S']:
            raise ValueError('Tipo deve ser E (Entrada) ou S (Saída)')
        return v

class AjusteEstoqueInDB(AjusteEstoqueBase):
    id: int
    empresa_id: int
    itens: List[AjusteEstoqueItemInDB] = []
    
    class Config:
        from_attributes = True
