from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.contabil.models import empresa_clientes, empresa_pedidos


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    contato = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    pedidos = relationship("Pedido", back_populates="cliente")
    empresas = relationship("Empresa", secondary=empresa_clientes, back_populates="clientes")


class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(500), nullable=True)
    valor_total = Column(Float, nullable=False, default=0.0)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cliente = relationship("Cliente", back_populates="pedidos")
    empresas = relationship("Empresa", secondary=empresa_pedidos, back_populates="pedidos")
