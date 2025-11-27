from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
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
    codigo = Column(String(50), nullable=False, unique=True, index=True)
    codigo_alternativo = Column(String(50), nullable=True, index=True)
    descricao = Column(String(255), nullable=False, index=True)
    tipo = Column(SQLEnum(TipoItem), nullable=False, index=True)
    grupo_id = Column(Integer, ForeignKey('grupos_itens.id'), nullable=True, index=True)
    unidade_padrao_id = Column(Integer, ForeignKey('unidades.id'), nullable=True, index=True)
    local_padrao_entrada_id = Column(Integer, ForeignKey('locais.id'), nullable=False, default=0, server_default='0', index=True)
    local_padrao_saida_id = Column(Integer, ForeignKey('locais.id'), nullable=False, default=0, server_default='0', index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    grupo = relationship("GrupoItem", back_populates="itens")
    unidade_padrao = relationship("Unidade")
    local_padrao_entrada = relationship("Local", foreign_keys=[local_padrao_entrada_id])
    local_padrao_saida = relationship("Local", foreign_keys=[local_padrao_saida_id])
    embalagens = relationship("EmbalagemItem", back_populates="item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Item(id={self.id}, codigo='{self.codigo}', descricao='{self.descricao}', tipo='{self.tipo}')>"
