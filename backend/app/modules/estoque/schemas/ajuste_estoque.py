from pydantic import BaseModel, Field, field_serializer, validator
from typing import Optional, List
from datetime import date
from decimal import Decimal

class AjusteEstoqueItemBase(BaseModel):
    item_id: int
    embalagem_id: Optional[int] = None
    quantidade: Decimal = Field(..., gt=0)
    valor_unitario: Decimal = Field(..., ge=0)
    valor_total: Decimal = Field(..., ge=0)
    lote_id: Optional[int] = None
    local_id: Optional[int] = None
    observacao: Optional[str] = Field(None, max_length=500)
    
    @field_serializer('quantidade', 'valor_unitario', 'valor_total', when_used='json')
    def serialize_decimal(self, v: Decimal) -> str:
        return str(v).replace('.', ',') if v is not None else None

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
        json_encoders = {
            Decimal: lambda v: str(v).replace('.', ',') if v is not None else None
        }

class AjusteEstoqueBase(BaseModel):
    data_entrada: date
    data_registro: date
    tipo: str = Field(..., pattern="^(E|S)$")
    valor: Decimal = Field(..., ge=0)
    serie: Optional[str] = Field(None, max_length=10)

    @validator('tipo')
    def validate_tipo(cls, v):
        if v not in ['E', 'S']:
            raise ValueError('Tipo deve ser E (Entrada) ou S (Saída)')
        return v

class AjusteEstoqueCreate(AjusteEstoqueBase):
    empresa_id: int
    itens: List[AjusteEstoqueItemCreate] = []
    # numero não é enviado, será gerado automaticamente

class AjusteEstoqueUpdate(BaseModel):
    numero: Optional[str] = Field(None, max_length=50)
    serie: Optional[str] = Field(None, max_length=10)
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

class AjusteEstoqueInDB(BaseModel):
    model_config = {
        "from_attributes": True,
        "json_encoders": {
            Decimal: lambda v: str(v).replace('.', ',') if v is not None else None
        }
    }
    
    id: int
    numero: str
    serie: Optional[str] = None
    data_entrada: date
    data_registro: date
    tipo: str
    valor: Decimal
    empresa_id: int
    itens: List[AjusteEstoqueItemInDB] = []
