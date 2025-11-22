from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class TipoMedida(str, Enum):
    QUANTIDADE = "Quantidade"
    PESO = "Peso"
    VOLUME = "Volume"
    COMPRIMENTO = "Comprimento"
    AREA = "Area"
    OUTROS = "Outros"


# Schemas para Unidade
class UnidadeBase(BaseModel):
    sigla: str = Field(..., max_length=10, description="Sigla da unidade (ex: KG, L, UN)")
    descricao: str = Field(..., max_length=100, description="Descrição da unidade")
    tipo_medida: TipoMedida = Field(TipoMedida.QUANTIDADE, description="Tipo de medida")


class UnidadeCreate(UnidadeBase):
    pass


class UnidadeUpdate(BaseModel):
    sigla: Optional[str] = Field(None, max_length=10)
    descricao: Optional[str] = Field(None, max_length=100)
    tipo_medida: Optional[TipoMedida] = None


class Unidade(UnidadeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
