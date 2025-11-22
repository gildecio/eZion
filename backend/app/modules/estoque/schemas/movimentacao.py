from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from enum import Enum


class TipoMovimentacao(str, Enum):
    Entrada = "Entrada"
    Saida = "Saida"
    Transferencia = "Transferencia"
    Ajuste_Positivo = "Ajuste Positivo"
    Ajuste_Negativo = "Ajuste Negativo"
    Inventario = "Inventario"
    Producao = "Producao"
    Devolucao = "Devolucao"


# Schemas para MovimentacaoEstoque
class MovimentacaoBase(BaseModel):
    tipo: TipoMovimentacao = Field(..., description="Tipo de movimentação")
    item_id: int = Field(..., description="ID do item")
    quantidade: Decimal = Field(..., gt=0, description="Quantidade movimentada")
    unidade_id: int = Field(..., description="ID da unidade de medida")
    lote_id: Optional[int] = Field(None, description="ID do lote (opcional)")
    local_origem_id: Optional[int] = Field(None, description="ID do local de origem")
    local_destino_id: Optional[int] = Field(None, description="ID do local de destino")
    documento: Optional[str] = Field(None, max_length=50, description="Número do documento")
    observacoes: Optional[str] = Field(None, description="Observações")
    custo_unitario: Optional[Decimal] = Field(None, description="Custo unitário (para entradas)")
    usuario: Optional[str] = Field(None, max_length=100, description="Usuário responsável")


class MovimentacaoCreate(MovimentacaoBase):
    data_movimentacao: Optional[datetime] = Field(None, description="Data da movimentação (se não informada, usa a data atual)")


class MovimentacaoUpdate(BaseModel):
    observacoes: Optional[str] = None
    documento: Optional[str] = None


class Movimentacao(MovimentacaoBase):
    id: int
    data_movimentacao: datetime
    saldo_anterior: Optional[Decimal] = None
    saldo_atual: Optional[Decimal] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Schema para consulta com dados completos
class MovimentacaoDetalhada(Movimentacao):
    item_codigo: Optional[str] = None
    item_descricao: Optional[str] = None
    unidade_sigla: Optional[str] = None
    lote_codigo: Optional[str] = None
    local_origem_nome: Optional[str] = None
    local_destino_nome: Optional[str] = None
