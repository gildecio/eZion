from app.repositories.base import CRUDBase
from app.modules.contabil.models.empresa import Empresa
from app.modules.contabil.schemas.empresa import EmpresaCreate, EmpresaUpdate
from sqlalchemy.orm import Session
from typing import Optional


class CRUDEmpresa(CRUDBase[Empresa, EmpresaCreate, EmpresaUpdate]):
    def get_by_cnpj(self, db: Session, *, cnpj: str) -> Optional[Empresa]:
        """Get empresa by CNPJ"""
        return db.query(Empresa).filter(Empresa.cnpj == cnpj).first()
    
    def get_active(self, db: Session, *, skip: int = 0, limit: int = 100):
        """Get only active empresas"""
        return db.query(Empresa).filter(Empresa.ativo == True).offset(skip).limit(limit).all()


empresa = CRUDEmpresa(Empresa)
