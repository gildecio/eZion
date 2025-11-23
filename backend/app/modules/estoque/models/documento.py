from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Documento(Base):
    __tablename__ = "documentos"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(50), nullable=False, index=True)
    data_registro = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    data_entrada = Column(DateTime(timezone=True), nullable=True, index=True)
    valor = Column(Numeric(15, 2), nullable=False)
    
    # Relacionamento com empresa
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="documentos")
    itens = relationship("DocumentoItem", back_populates="documento", cascade="all, delete-orphan")
