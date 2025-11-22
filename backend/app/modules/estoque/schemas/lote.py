from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


# Schemas para Lote
class LoteBase(BaseModel):
    codigo: str = Field(..., max_length=50, description="Código único do lote")
    data_fabricacao: Optional[date] = Field(None, description="Data de fabricação")
    data_validade: Optional[date] = Field(None, description="Data de validade")
    observacoes: Optional[str] = Field(None, description="Observações sobre o lote")


class LoteCreate(LoteBase):
    pass


class LoteUpdate(BaseModel):
    codigo: Optional[str] = Field(None, max_length=50)
    data_fabricacao: Optional[date] = None
    data_validade: Optional[date] = None
    observacoes: Optional[str] = None


class Lote(LoteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
