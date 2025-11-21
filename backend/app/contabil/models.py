from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Table,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


# Tabelas de associação (muitos-para-muitos entre Empresa e outras entidades)
empresa_clientes = Table(
    "empresa_clientes",
    Base.metadata,
    Column("empresa_id", Integer, ForeignKey("empresas.id"), primary_key=True),
    Column("cliente_id", Integer, ForeignKey("clientes.id"), primary_key=True),
)

empresa_pedidos = Table(
    "empresa_pedidos",
    Base.metadata,
    Column("empresa_id", Integer, ForeignKey("empresas.id"), primary_key=True),
    Column("pedido_id", Integer, ForeignKey("pedidos.id"), primary_key=True),
)


class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    identifier = Column(String(100), nullable=True)  # e.g., CNPJ
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    clientes = relationship("Cliente", secondary=empresa_clientes, back_populates="empresas")
    pedidos = relationship("Pedido", secondary=empresa_pedidos, back_populates="empresas")
