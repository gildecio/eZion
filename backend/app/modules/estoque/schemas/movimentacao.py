from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from enum import Enum


class TipoMovimentacao(str, Enum):
    ENTRADA = "ENTRADA"
    SAIDA = "SAIDA"
    TRANSFERENCIA = "TRANSFERENCIA"
    AJUSTE_ENTRADA = "AJUSTE_ENTRADA"
    AJUSTE_SAIDA = "AJUSTE_SAIDA"
    INVENTARIO = "INVENTARIO"
    PRODUCAO = "PRODUCAO"
    DEVOLUCAO = "DEVOLUCAO"


# Schemas para MovimentacaoEstoque
class MovimentacaoBase(BaseModel):
    tipo: TipoMovimentacao = Field(..., description="Tipo de movimentação")
    item_id: int = Field(..., description="ID do item")
    quantidade: Decimal = Field(..., gt=0, description="Quantidade movimentada")
    unidade_id: int = Field(..., description="ID da unidade de medida")
    lote_id: Optional[int] = Field(None, description="ID do lote (opcional)")
    local_id: Optional[int] = Field(None, description="ID do local da movimentação")
    numero: Optional[str] = Field(None, max_length=50, description="Número do documento")
    serie: Optional[str] = Field(None, max_length=10, description="Série do documento")
    observacoes: Optional[str] = Field(None, description="Observações")
    custo_unitario: Optional[Decimal] = Field(None, description="Custo unitário (para entradas)")
    usuario: Optional[str] = Field(None, max_length=100, description="Usuário responsável")


class MovimentacaoCreate(MovimentacaoBase):
    data_movimentacao: Optional[datetime] = Field(None, description="Data da movimentação (se não informada, usa a data atual)")


class MovimentacaoUpdate(BaseModel):
    observacoes: Optional[str] = None
    numero: Optional[str] = None
    serie: Optional[str] = None


class Movimentacao(MovimentacaoBase):
    id: int
    data_movimentacao: datetime
    saldo_anterior: Optional[Decimal] = None
    saldo_atual: Optional[Decimal] = None
    item_codigo: Optional[str] = None
    item_nome: Optional[str] = None
    unidade_sigla: Optional[str] = None
    lote_codigo: Optional[str] = None
    local_nome: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: str(v).replace('.', ',') if v is not None else None
        }


# Schema para consulta com dados completos
class MovimentacaoDetalhada(Movimentacao):
    item_codigo: Optional[str] = None
    item_descricao: Optional[str] = None
    unidade_sigla: Optional[str] = None
    lote_codigo: Optional[str] = None
    # Mantido apenas um local
