from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.modules.estoque.models.ajuste_estoque import AjusteEstoque, AjusteEstoqueItem
from app.modules.estoque.schemas.ajuste_estoque import AjusteEstoqueCreate, AjusteEstoqueUpdate


class AjusteEstoqueRepository(CRUDBase[AjusteEstoque, AjusteEstoqueCreate, AjusteEstoqueUpdate]):
    def __init__(self):
        super().__init__(AjusteEstoque)
    
    def get_by_empresa(self, db: Session, empresa_id: int, skip: int = 0, limit: int = 100) -> List[AjusteEstoque]:
        return db.query(self.model).filter(
            AjusteEstoque.empresa_id == empresa_id
        ).offset(skip).limit(limit).all()
    
    def get_by_numero(self, db: Session, numero: str) -> Optional[AjusteEstoque]:
        return db.query(self.model).filter(
            AjusteEstoque.numero == numero
        ).first()
    
    def create_with_itens(self, db: Session, obj_in: AjusteEstoqueCreate) -> AjusteEstoque:
        """Cria um ajuste com seus itens"""
        itens_data = obj_in.itens if obj_in.itens else []
        obj_data = obj_in.model_dump(exclude={'itens'})
        
        db_obj = self.model(**obj_data)
        db.add(db_obj)
        db.flush()  # Get the ID
        
        # Add items
        for item_data in itens_data:
            item_dict = item_data.model_dump() if hasattr(item_data, 'model_dump') else item_data.dict()
            item_obj = AjusteEstoqueItem(**item_dict, ajuste_id=db_obj.id)
            db.add(item_obj)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_with_itens(self, db: Session, db_obj: AjusteEstoque, obj_in: AjusteEstoqueUpdate) -> AjusteEstoque:
        """Atualiza um ajuste e seus itens"""
        update_data = obj_in.model_dump(exclude_unset=True, exclude={'itens'})
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        # Update items if provided
        if obj_in.itens is not None:
            # Remove existing items
            db.query(AjusteEstoqueItem).filter(
                AjusteEstoqueItem.ajuste_id == db_obj.id
            ).delete()
            
            # Add new items
            for item_data in obj_in.itens:
                item_dict = item_data.model_dump() if hasattr(item_data, 'model_dump') else item_data.dict()
                item_obj = AjusteEstoqueItem(**item_dict, ajuste_id=db_obj.id)
                db.add(item_obj)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj


class AjusteEstoqueItemRepository(CRUDBase[AjusteEstoqueItem, dict, dict]):
    def __init__(self):
        super().__init__(AjusteEstoqueItem)
    
    def get_by_ajuste(self, db: Session, ajuste_id: int) -> List[AjusteEstoqueItem]:
        return db.query(self.model).filter(
            AjusteEstoqueItem.ajuste_id == ajuste_id
        ).all()


# Repository instances
ajuste_estoque_repository = AjusteEstoqueRepository()
ajuste_estoque_item_repository = AjusteEstoqueItemRepository()

