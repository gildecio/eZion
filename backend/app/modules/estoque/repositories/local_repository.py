from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.modules.estoque.models.local import Local
from app.modules.estoque.schemas.local import LocalCreate, LocalUpdate


class LocalRepository(CRUDBase[Local, LocalCreate, LocalUpdate]):
    def get_by_codigo(self, db: Session, *, codigo: str) -> Optional[Local]:
        """Busca um local pelo código"""
        return db.query(Local).filter(Local.codigo == codigo).first()

    def get_ativos(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Local]:
        """Retorna apenas os locais ativos"""
        return db.query(Local).filter(Local.ativo == True).offset(skip).limit(limit).all()


local_repository = LocalRepository(Local)
