from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class EmbalagemItem(Base):
    __tablename__ = "embalagens_item"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("itens.id"), nullable=False)
    unidade_id = Column(Integer, ForeignKey("unidades.id"), nullable=False)
    descricao = Column(String(100), nullable=False)  # Ex: "Caixa com 12 unidades", "Tonelada"
    fator_conversao = Column(Numeric(15, 6), nullable=False)  # Quantas unidades padrão representa
    codigo_barras = Column(String(50), nullable=True)  # EAN, código de barras da embalagem
    padrao = Column(Boolean, default=False)  # Se é a embalagem padrão do item
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    item = relationship("Item", back_populates="embalagens")
    unidade = relationship("Unidade")

    def __repr__(self):
        return f"<EmbalagemItem(id={self.id}, descricao='{self.descricao}', fator={self.fator_conversao})>"
