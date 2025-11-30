from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum
from datetime import datetime

class StatusRequisicao(enum.Enum):
    ABERTA = "ABERTA"
    ATENDIDA = "ATENDIDA"
    PARCIAL = "PARCIAL"
    CANCELADA = "CANCELADA"

class Requisicao(Base):
    __tablename__ = "requisicoes"

    id = Column(Integer, primary_key=True, index=True)
    solicitante = Column(String(100), nullable=False)
    data_requisicao = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(StatusRequisicao), default=StatusRequisicao.ABERTA, nullable=False)
    local_id = Column(Integer, ForeignKey("locais.id"), nullable=True, index=True)

    itens = relationship("RequisicaoItem", back_populates="requisicao")
    local = relationship("Local", foreign_keys=[local_id])

class RequisicaoItem(Base):
    __tablename__ = "requisicao_itens"

    id = Column(Integer, primary_key=True, index=True)
    requisicao_id = Column(Integer, ForeignKey("requisicoes.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("itens.id"), nullable=False)
    embalagem_id = Column(Integer, ForeignKey("embalagens.id"), nullable=False)
    quantidade = Column(Integer, nullable=False)
    atendida = Column(Integer, default=0)  # Quantidade atendida

    requisicao = relationship("Requisicao", back_populates="itens")
    # item = relationship("Item") # Relacionamento se necessário
