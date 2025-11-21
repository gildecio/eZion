from sqlalchemy.orm import Session
from typing import List, Optional
from app.contabil import models, schemas


def create_empresa(db: Session, empresa: schemas.EmpresaCreate) -> models.Empresa:
    db_obj = models.Empresa(name=empresa.name, identifier=empresa.identifier)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_empresa(db: Session, empresa_id: int) -> Optional[models.Empresa]:
    return db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()


def list_empresas(db: Session, skip: int = 0, limit: int = 100) -> List[models.Empresa]:
    return db.query(models.Empresa).offset(skip).limit(limit).all()


pass
