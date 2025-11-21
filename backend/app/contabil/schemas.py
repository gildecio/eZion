from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class EmpresaBase(BaseModel):
    name: str
    identifier: Optional[str] = None


class EmpresaCreate(EmpresaBase):
    pass


class EmpresaRead(EmpresaBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
