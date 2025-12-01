from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import enum

class StatusRequisicaoEnum(str, enum.Enum):
    ABERTA = "ABERTA"
    ATENDIDA = "ATENDIDA"
    PARCIAL = "PARCIAL"
    CANCELADA = "CANCELADA"

class RequisicaoItemBase(BaseModel):
    item_id: int
    embalagem_id: int
    quantidade: int
    atendida: int = 0

class RequisicaoItemCreate(RequisicaoItemBase):
    pass

class RequisicaoItem(RequisicaoItemBase):
    id: int
    class Config:
        orm_mode = True

class RequisicaoBase(BaseModel):
    numero: str
    serie: Optional[str] = None
    solicitante: str
    local_id: Optional[int] = None

class RequisicaoCreate(BaseModel):
    solicitante: str
    local_id: Optional[int] = None
    itens: List[RequisicaoItemCreate]

class RequisicaoUpdate(RequisicaoBase):
    status: Optional[StatusRequisicaoEnum] = None
    itens: Optional[List[RequisicaoItemCreate]] = None

class Requisicao(RequisicaoBase):
    id: int
    data_requisicao: datetime
    status: StatusRequisicaoEnum
    itens: List[RequisicaoItem]
    class Config:
        orm_mode = True
