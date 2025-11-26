from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Embalagem(Base):
    __tablename__ = "embalagens"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(100), nullable=False, index=True)
    unidade_id = Column(Integer, ForeignKey("unidades.id"), nullable=False, index=True)
    ativo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    unidade = relationship("Unidade")

    def __repr__(self):
        return f"<Embalagem(id={self.id}, descricao='{self.descricao}', unidade_id={self.unidade_id}, ativo={self.ativo})>"
