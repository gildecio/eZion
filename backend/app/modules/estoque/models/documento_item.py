from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class DocumentoItem(Base):
    __tablename__ = "documento_itens"

    id = Column(Integer, primary_key=True, index=True)
    quantidade = Column(Numeric(15, 4), nullable=False)
    valor_unitario = Column(Numeric(15, 2), nullable=False)
    valor_total = Column(Numeric(15, 2), nullable=False)
    
    # Relacionamento com documento
    documento_id = Column(Integer, ForeignKey("documentos.id"), nullable=False, index=True)
    
    # Relacionamento com item
    item_id = Column(Integer, ForeignKey("itens.id"), nullable=False, index=True)
    
    # Relacionamento com local
    local_id = Column(Integer, ForeignKey("locais.id"), nullable=False, index=True)

    # Relacionamentos
    documento = relationship("Documento", back_populates="itens")
    item = relationship("Item", back_populates="documento_itens")
    local = relationship("Local", back_populates="documento_itens")

    def __repr__(self):
        return f"<DocumentoItem(id={self.id}, documento_id={self.documento_id}, item_id={self.item_id})>"
