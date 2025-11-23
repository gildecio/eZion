from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.modules.estoque.models.documento import Documento
from app.modules.estoque.schemas.documento import DocumentoCreate, DocumentoUpdate
from typing import List, Optional
from datetime import datetime


class DocumentoRepository(CRUDBase[Documento, DocumentoCreate, DocumentoUpdate]):
    
    def get_by_numero(self, db: Session, *, numero: str) -> Optional[Documento]:
        """Busca documento por número"""
        return db.query(self.model).filter(self.model.numero == numero).first()
    
    def get_by_empresa(
        self, 
        db: Session, 
        *, 
        empresa_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Documento]:
        """Busca documentos de uma empresa"""
        return (
            db.query(self.model)
            .filter(self.model.empresa_id == empresa_id)
            .order_by(self.model.data_registro.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_periodo(
        self,
        db: Session,
        *,
        data_inicio: datetime,
        data_fim: datetime,
        empresa_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Documento]:
        """Busca documentos por período"""
        query = db.query(self.model).filter(
            self.model.data_registro >= data_inicio,
            self.model.data_registro <= data_fim
        )
        
        if empresa_id:
            query = query.filter(self.model.empresa_id == empresa_id)
        
        return (
            query
            .order_by(self.model.data_registro.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )


documento_repository = DocumentoRepository(Documento)
