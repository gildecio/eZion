from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


# Schemas para SaldoEstoque
class SaldoBase(BaseModel):
    item_id: int = Field(..., description="ID do item")
    local_id: int = Field(..., description="ID do local")
    lote_id: Optional[int] = Field(None, description="ID do lote (opcional)")
    quantidade: Decimal = Field(default=0, description="Quantidade em estoque")
    custo_medio: Optional[Decimal] = Field(None, description="Custo médio unitário")


class SaldoCreate(SaldoBase):
    pass


class SaldoUpdate(BaseModel):
    quantidade: Optional[Decimal] = None
    custo_medio: Optional[Decimal] = None


class Saldo(SaldoBase):
    id: int
    ultima_atualizacao: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: str(v).replace('.', ',') if v is not None else None
        }


# Schema para consulta com dados completos
class SaldoDetalhado(Saldo):
    item_codigo: Optional[str] = None
    item_descricao: Optional[str] = None
    local_codigo: Optional[str] = None
    local_nome: Optional[str] = None
    lote_codigo: Optional[str] = None
    unidade_padrao_sigla: Optional[str] = None
    valor_total: Optional[Decimal] = None  # quantidade * custo_medio
