from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum


class TipoSequenciaEnum(str, Enum):
    ANUAL = "ANUAL"
    CONTINUO = "CONTINUO"


class SequenciaBase(BaseModel):
    documento_tipo: str = Field(..., max_length=50)
    numero: int = Field(default=1, ge=0)
    serie: Optional[str] = Field(None, max_length=10)
    numero_maximo: int = Field(default=999999, ge=1)
    tipo: TipoSequenciaEnum = TipoSequenciaEnum.CONTINUO

    @field_validator('serie', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        if v == '' or v == 'undefined':
            return None
        return v


class SequenciaCreate(SequenciaBase):
    empresa_id: int


class SequenciaUpdate(BaseModel):
    documento_tipo: Optional[str] = Field(None, max_length=50)
    numero: Optional[int] = Field(None, ge=0)
    serie: Optional[str] = Field(None, max_length=10)
    numero_maximo: Optional[int] = Field(None, ge=1)
    tipo: Optional[TipoSequenciaEnum] = None

    @field_validator('serie', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        if v == '' or v == 'undefined':
            return None
        return v


class SequenciaInDB(BaseModel):
    id: int
    documento_tipo: str
    numero: int
    serie: Optional[str]
    numero_maximo: int
    empresa_id: int
    tipo: TipoSequenciaEnum
    
    class Config:
        from_attributes = True