from pydantic import BaseModel, Field, field_validator
import re


class EmpresaBase(BaseModel):
    razao_social: str = Field(..., min_length=1, max_length=255, description="Razão social da empresa")
    cnpj: str = Field(..., min_length=14, max_length=14, description="CNPJ da empresa (apenas números)")
    ativo: bool = Field(default=True, description="Status da empresa")

    @field_validator('cnpj')
    @classmethod
    def validate_cnpj(cls, v: str) -> str:
        # Remove formatação
        cnpj = re.sub(r'\D', '', v)
        
        if len(cnpj) != 14:
            raise ValueError('CNPJ deve ter 14 dígitos')
        
        # Validação básica de CNPJ
        if cnpj == cnpj[0] * 14:
            raise ValueError('CNPJ inválido')
        
        return cnpj


class EmpresaCreate(EmpresaBase):
    pass


class EmpresaUpdate(BaseModel):
    razao_social: str | None = Field(None, min_length=1, max_length=255)
    cnpj: str | None = Field(None, min_length=14, max_length=14)
    ativo: bool | None = None

    @field_validator('cnpj')
    @classmethod
    def validate_cnpj(cls, v: str | None) -> str | None:
        if v is None:
            return v
        
        cnpj = re.sub(r'\D', '', v)
        
        if len(cnpj) != 14:
            raise ValueError('CNPJ deve ter 14 dígitos')
        
        if cnpj == cnpj[0] * 14:
            raise ValueError('CNPJ inválido')
        
        return cnpj


class EmpresaInDB(EmpresaBase):
    id: int

    class Config:
        from_attributes = True


class EmpresaResponse(EmpresaInDB):
    pass
