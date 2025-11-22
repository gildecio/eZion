from sqlalchemy.orm import Session
from typing import List, Optional
from app.repositories.base import CRUDBase
from app.modules.estoque.models import Lote
from app.modules.estoque.schemas import LoteCreate, LoteUpdate


class LoteRepository(CRUDBase[Lote, LoteCreate, LoteUpdate]):
    def get_by_codigo(self, db: Session, *, codigo: str) -> Optional[Lote]:
        """Busca um lote pelo código"""
        return db.query(self.model).filter(self.model.codigo == codigo).first()
    
    def get_validos(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Lote]:
        """Retorna lotes que ainda não venceram"""
        from datetime import date
        return (
            db.query(self.model)
            .filter(
                (self.model.data_validade.is_(None)) | 
                (self.model.data_validade >= date.today())
            )
            .offset(skip)
            .limit(limit)
            .all()
        )


lote_repository = LoteRepository(Lote)
