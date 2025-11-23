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
    
    # Campos específicos para Notas Fiscais
    chave_nfe: Optional[str] = Field(None, max_length=44)
    serie: Optional[str] = Field(None, max_length=10)
    modelo: Optional[str] = Field(None, max_length=10)
    cnpj_emissor: Optional[str] = Field(None, max_length=14)
    nome_emissor: Optional[str] = Field(None, max_length=255)
    cnpj_destinatario: Optional[str] = Field(None, max_length=14)
    nome_destinatario: Optional[str] = Field(None, max_length=255)
    
    # Campos para Transferências
    local_origem_id: Optional[int] = None
    local_destino_id: Optional[int] = None
    
    # Campos para Ordem de Produção
    lote_producao: Optional[str] = Field(None, max_length=50)
    data_inicio_producao: Optional[datetime] = None
    data_fim_producao: Optional[datetime] = None
    
    # Campos para Requisição de Material
    centro_custo: Optional[str] = Field(None, max_length=50)
    solicitante: Optional[str] = Field(None, max_length=255)
    ordem_producao_referencia: Optional[str] = Field(None, max_length=50)
    
    # Campos para Ajustes
    motivo_ajuste: Optional[str] = Field(None, max_length=500)
    responsavel_ajuste: Optional[str] = Field(None, max_length=255)
    
    # Campos para Remessa
    data_retorno_prevista: Optional[datetime] = None
    destinatario_remessa: Optional[str] = Field(None, max_length=255)
    
    # Campo genérico
    observacoes: Optional[str] = Field(None, max_length=1000)

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
    
    # Campos específicos (todos opcionais no update)
    chave_nfe: Optional[str] = Field(None, max_length=44)
    serie: Optional[str] = Field(None, max_length=10)
    modelo: Optional[str] = Field(None, max_length=10)
    cnpj_emissor: Optional[str] = Field(None, max_length=14)
    nome_emissor: Optional[str] = Field(None, max_length=255)
    cnpj_destinatario: Optional[str] = Field(None, max_length=14)
    nome_destinatario: Optional[str] = Field(None, max_length=255)
    local_origem_id: Optional[int] = None
    local_destino_id: Optional[int] = None
    lote_producao: Optional[str] = Field(None, max_length=50)
    data_inicio_producao: Optional[datetime] = None
    data_fim_producao: Optional[datetime] = None
    centro_custo: Optional[str] = Field(None, max_length=50)
    solicitante: Optional[str] = Field(None, max_length=255)
    ordem_producao_referencia: Optional[str] = Field(None, max_length=50)
    motivo_ajuste: Optional[str] = Field(None, max_length=500)
    responsavel_ajuste: Optional[str] = Field(None, max_length=255)
    data_retorno_prevista: Optional[datetime] = None
    destinatario_remessa: Optional[str] = Field(None, max_length=255)
    observacoes: Optional[str] = Field(None, max_length=1000)

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
