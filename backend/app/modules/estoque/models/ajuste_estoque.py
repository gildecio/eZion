from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum

class TipoAjuste(str, enum.Enum):
    ENTRADA = "E"
    SAIDA = "S"

class AjusteEstoque(Base):
    __tablename__ = "ajuste_estoque"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(50), nullable=False, unique=True, index=True)
    data_entrada = Column(Date, nullable=False)
    data_registro = Column(Date, nullable=False)
    tipo = Column(String(1), nullable=False)
    valor = Column(Numeric(15, 2), nullable=False, default=0)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    itens = relationship("AjusteEstoqueItem", back_populates="ajuste", cascade="all, delete-orphan")

class AjusteEstoqueItem(Base):
    __tablename__ = "ajuste_estoque_itens"

    id = Column(Integer, primary_key=True, index=True)
    ajuste_id = Column(Integer, ForeignKey("ajuste_estoque.id", ondelete="CASCADE"), nullable=False)
    item_id = Column(Integer, ForeignKey("itens.id"), nullable=False)
    quantidade = Column(Numeric(15, 3), nullable=False)
    valor_unitario = Column(Numeric(15, 2), nullable=False)
    valor_total = Column(Numeric(15, 2), nullable=False)
    lote_id = Column(Integer, ForeignKey("lotes.id"), nullable=True)
    local_id = Column(Integer, ForeignKey("locais.id"), nullable=True)
    observacao = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    ajuste = relationship("AjusteEstoque", back_populates="itens")
    item = relationship("Item")
    lote = relationship("Lote")
    local = relationship("Local")
