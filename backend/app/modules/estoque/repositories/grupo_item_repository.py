from typing import Optional, List
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.modules.estoque.models import GrupoItem
from app.modules.estoque.schemas import GrupoItemCreate, GrupoItemUpdate


class GrupoItemRepository(CRUDBase[GrupoItem, GrupoItemCreate, GrupoItemUpdate]):
    def __init__(self):
        super().__init__(GrupoItem)
    
    def get_roots(self, db: Session) -> List[GrupoItem]:
        """Retorna todos os grupos raiz (sem pai)"""
        return db.query(GrupoItem).filter(GrupoItem.parent_id.is_(None)).all()
    
    def get_children(self, db: Session, parent_id: int) -> List[GrupoItem]:
        """Retorna todos os filhos de um grupo"""
        return db.query(GrupoItem).filter(GrupoItem.parent_id == parent_id).all()
    
    def get_leaves(self, db: Session) -> List[GrupoItem]:
        """Retorna apenas grupos folha (sem filhos)"""
        subquery = db.query(GrupoItem.parent_id).filter(
            GrupoItem.parent_id.isnot(None)
        ).distinct()
        
        return db.query(GrupoItem).filter(
            ~GrupoItem.id.in_(subquery)
        ).all()
    
    def validate_leaf(self, db: Session, grupo_id: int) -> bool:
        """Verifica se o grupo é folha (não tem filhos)"""
        children_count = db.query(GrupoItem).filter(
            GrupoItem.parent_id == grupo_id
        ).count()
        return children_count == 0
    
    def get_with_children(self, db: Session, grupo_id: int) -> Optional[GrupoItem]:
        """Retorna grupo com filhos carregados"""
        grupo = self.get(db, grupo_id)
        if grupo:
            # Force load children relationship
            _ = grupo.children
        return grupo
    
    def build_tree(self, db: Session, parent_id: Optional[int] = None) -> List[GrupoItem]:
        """Constrói árvore hierárquica a partir de um nó (ou raiz se None)"""
        if parent_id is None:
            nodes = self.get_roots(db)
        else:
            nodes = self.get_children(db, parent_id)
        
        # Recursivamente carrega filhos
        for node in nodes:
            node._children = self.build_tree(db, node.id)
        
        return nodes
    
    def has_circular_reference(self, db: Session, grupo_id: int, new_parent_id: Optional[int]) -> bool:
        """Verifica se atualizar parent_id criaria referência circular"""
        if new_parent_id is None:
            return False
        
        if grupo_id == new_parent_id:
            return True
        
        # Verifica se new_parent_id é descendente de grupo_id
        current = db.query(GrupoItem).filter(GrupoItem.id == new_parent_id).first()
        visited = set()
        
        while current and current.parent_id:
            if current.parent_id == grupo_id:
                return True
            if current.parent_id in visited:
                break
            visited.add(current.parent_id)
            current = db.query(GrupoItem).filter(GrupoItem.id == current.parent_id).first()
        
        return False


grupo_item_repository = GrupoItemRepository()
