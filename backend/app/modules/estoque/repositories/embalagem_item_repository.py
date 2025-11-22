from typing import List
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.modules.estoque.models import EmbalagemItem
from app.modules.estoque.schemas import EmbalagemItemCreate, EmbalagemItemUpdate


class EmbalagemItemRepository(CRUDBase[EmbalagemItem, EmbalagemItemCreate, EmbalagemItemUpdate]):
    def __init__(self):
        super().__init__(EmbalagemItem)
    
    def get_by_item(self, db: Session, item_id: int) -> List[EmbalagemItem]:
        """Retorna todas as embalagens de um item específico"""
        return db.query(EmbalagemItem).filter(EmbalagemItem.item_id == item_id).all()
    
    def get_padrao_by_item(self, db: Session, item_id: int) -> EmbalagemItem | None:
        """Retorna a embalagem padrão de um item"""
        return db.query(EmbalagemItem).filter(
            EmbalagemItem.item_id == item_id,
            EmbalagemItem.padrao == True
        ).first()


embalagem_item_repository = EmbalagemItemRepository()
