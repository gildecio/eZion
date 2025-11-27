from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class EmbalagemBase(BaseModel):
    descricao: str = Field(..., max_length=100, description="Descrição da embalagem")
    unidade_id: int = Field(..., description="ID da unidade de medida")
    fator_conversao: Decimal = Field(..., gt=0, description="Fator de conversão da embalagem")
    ativo: bool = Field(True, description="Se a embalagem está ativa")


class EmbalagemCreate(EmbalagemBase):
    pass


class EmbalagemUpdate(BaseModel):
    descricao: Optional[str] = Field(None, max_length=100)
    unidade_id: Optional[int] = None
    fator_conversao: Optional[Decimal] = Field(None, gt=0)
    ativo: Optional[bool] = None


class Embalagem(EmbalagemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
