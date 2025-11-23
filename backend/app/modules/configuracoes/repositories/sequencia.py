from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.modules.configuracoes.models.sequencia import Sequencia
from app.modules.configuracoes.schemas.sequencia import SequenciaCreate, SequenciaUpdate


class SequenciaRepository(CRUDBase[Sequencia, SequenciaCreate, SequenciaUpdate]):
    def __init__(self):
        super().__init__(Sequencia)

    def get_by_empresa(self, db: Session, empresa_id: int, skip: int = 0, limit: int = 100) -> List[Sequencia]:
        return db.query(self.model).filter(
            Sequencia.empresa_id == empresa_id
        ).offset(skip).limit(limit).all()

    def get_by_documento_tipo(
        self, 
        db: Session, 
        empresa_id: int, 
        documento_tipo: str, 
        serie: Optional[str] = None
    ) -> Optional[Sequencia]:
        query = db.query(self.model).filter(
            Sequencia.empresa_id == empresa_id,
            Sequencia.documento_tipo == documento_tipo
        )
        
        if serie:
            query = query.filter(Sequencia.serie == serie)
        else:
            query = query.filter(Sequencia.serie.is_(None))
            
        return query.first()


sequencia_repository = SequenciaRepository()
