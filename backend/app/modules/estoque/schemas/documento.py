from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.modules.estoque.models.documento import TipoDocumento


class DocumentoBase(BaseModel):
    numero: str = Field(..., max_length=50)
    tipo_documento: TipoDocumento
    data_registro: datetime
    data_entrada: Optional[datetime] = None
    valor: Decimal = Field(..., ge=0)
    empresa_id: int

    @field_validator('numero')
    @classmethod
    def numero_nao_vazio(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Número do documento não pode ser vazio')
        return v.strip()


class DocumentoCreate(DocumentoBase):
    pass


class DocumentoUpdate(BaseModel):
    numero: Optional[str] = Field(None, max_length=50)
    tipo_documento: Optional[TipoDocumento] = None
    data_registro: Optional[datetime] = None
    data_entrada: Optional[datetime] = None
    valor: Optional[Decimal] = Field(None, ge=0)
    empresa_id: Optional[int] = None

    @field_validator('numero')
    @classmethod
    def numero_nao_vazio(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not v or not v.strip()):
            raise ValueError('Número do documento não pode ser vazio')
        return v.strip() if v else None


class Documento(DocumentoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
