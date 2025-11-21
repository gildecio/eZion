from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from .types import TipoItem


class EstoqueItemBase(BaseModel):
    tipo: TipoItem
    quantity: float
    location: Optional[str] = None


class EstoqueItemCreate(EstoqueItemBase):
    pass


class EstoqueItemRead(EstoqueItemBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
