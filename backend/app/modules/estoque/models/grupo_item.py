from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class GrupoItem(Base):
    __tablename__ = "grupos_itens"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey('grupos_itens.id'), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamento hierárquico (self-referencing)
    parent = relationship("GrupoItem", remote_side=[id], backref="children")
    
    # Relacionamento com itens
    itens = relationship("Item", back_populates="grupo", lazy="select")

    def __repr__(self):
        return f"<GrupoItem(id={self.id}, nome='{self.nome}', parent_id={self.parent_id})>"

    @property
    def is_leaf(self) -> bool:
        """Verifica se é um grupo folha (não tem filhos)"""
        return len(self.children) == 0

    def get_level(self, db) -> int:
        """Retorna o nível na hierarquia (0 = raiz)"""
        level = 0
        current = self
        while current.parent_id is not None:
            level += 1
            current = db.query(GrupoItem).get(current.parent_id)
            if current is None:
                break
        return level

    def get_path(self, db) -> list:
        """Retorna o caminho completo da raiz até este nó"""
        path = [self]
        current = self
        while current.parent_id is not None:
            current = db.query(GrupoItem).filter(GrupoItem.id == current.parent_id).first()
            if current:
                path.insert(0, current)
            else:
                break
        return path
