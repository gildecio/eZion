from sqlalchemy.orm import Session
from typing import List, Optional
from app.repositories.base import CRUDBase
from app.modules.estoque.models import Item
from app.modules.estoque.schemas import ItemCreate, ItemUpdate
from app.modules.estoque.models.item import TipoItem


class ItemRepository(CRUDBase[Item, ItemCreate, ItemUpdate]):
    def get_with_filters(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        grupo_id: Optional[int] = None,
        tipo: Optional[TipoItem] = None
    ) -> List[Item]:
        """
        Busca itens com filtros opcionais
        
        Args:
            db: Sessão do banco de dados
            skip: Número de registros para pular
            limit: Número máximo de registros
            grupo_id: ID do grupo (use 0 para itens sem grupo, None para todos)
            tipo: Tipo do item
        
        Returns:
            Lista de itens filtrados
        """
        query = db.query(self.model)
        
        # Filtro por grupo
        if grupo_id is not None:
            if grupo_id == 0:
                # Itens sem grupo
                query = query.filter(self.model.grupo_id.is_(None))
            else:
                # Itens do grupo específico
                query = query.filter(self.model.grupo_id == grupo_id)
        
        # Filtro por tipo
        if tipo is not None:
            query = query.filter(self.model.tipo == tipo)
        
        return query.offset(skip).limit(limit).all()


item_repository = ItemRepository(Item)
