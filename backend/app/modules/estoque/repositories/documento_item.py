from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.modules.estoque.models.documento_item import DocumentoItem
from app.modules.estoque.schemas.documento_item import DocumentoItemCreate, DocumentoItemUpdate
from typing import List, Optional


class DocumentoItemRepository(CRUDBase[DocumentoItem, DocumentoItemCreate, DocumentoItemUpdate]):
    
    def get_by_documento(
        self,
        db: Session,
        *,
        documento_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[DocumentoItem]:
        """Busca todos os itens de um documento"""
        return (
            db.query(DocumentoItem)
            .filter(DocumentoItem.documento_id == documento_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_item(
        self,
        db: Session,
        *,
        item_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[DocumentoItem]:
        """Busca todos os documentos que contêm um item específico"""
        return (
            db.query(DocumentoItem)
            .filter(DocumentoItem.item_id == item_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_local(
        self,
        db: Session,
        *,
        local_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[DocumentoItem]:
        """Busca todos os itens de documentos de um local específico"""
        return (
            db.query(DocumentoItem)
            .filter(DocumentoItem.local_id == local_id)
            .offset(skip)
            .limit(limit)
            .all()
        )


documento_item_repository = DocumentoItemRepository(DocumentoItem)
