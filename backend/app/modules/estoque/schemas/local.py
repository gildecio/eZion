from pydantic import BaseModel, Field
from typing import Optional


class LocalBase(BaseModel):
    codigo: str = Field(..., min_length=1, max_length=20, description="Código único do local")
    nome: str = Field(..., min_length=1, max_length=100, description="Nome do local")
    descricao: Optional[str] = Field(None, max_length=255, description="Descrição do local")
    ativo: bool = Field(default=True, description="Indica se o local está ativo")


class LocalCreate(LocalBase):
    pass


class LocalUpdate(BaseModel):
    codigo: Optional[str] = Field(None, min_length=1, max_length=20)
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    descricao: Optional[str] = Field(None, max_length=255)
    ativo: Optional[bool] = None


class LocalInDB(LocalBase):
    id: int

    class Config:
        from_attributes = True
