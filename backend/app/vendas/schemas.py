from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class ClienteBase(BaseModel):
    nome: str
    contato: Optional[str] = None


class ClienteCreate(ClienteBase):
    empresa_ids: Optional[List[int]] = []


class ClienteRead(ClienteBase):
    id: int
    created_at: datetime
    empresas: Optional[List["EmpresaRead"]] = []
    model_config = ConfigDict(from_attributes=True)


class PedidoBase(BaseModel):
    descricao: Optional[str] = None
    valor_total: Optional[float] = 0.0
    cliente_id: Optional[int] = None
    empresa_ids: Optional[List[int]] = []


class PedidoCreate(PedidoBase):
    pass


class PedidoRead(PedidoBase):
    id: int
    created_at: datetime
    cliente: Optional[ClienteRead] = None
    empresas: Optional[List["EmpresaRead"]] = []
    model_config = ConfigDict(from_attributes=True)


class EmpresaRead(BaseModel):
    id: int
    name: str
    identifier: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)