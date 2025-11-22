from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class TipoItem(str, enum.Enum):
    PRODUTO = "Produto"
    PRODUTO_EM_CRIACAO = "Produto em Criação"
    INSUMO = "Insumo"
    IMOBILIZADO = "Imobilizado"
    SERVICO = "Servico"
    EMBALAGEM = "Embalagem"
    OUTROS = "Outros"


class Item(Base):
    __tablename__ = "itens"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(255), nullable=False, index=True)
    tipo = Column(SQLEnum(TipoItem), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Item(id={self.id}, descricao='{self.descricao}', tipo='{self.tipo}')>"
