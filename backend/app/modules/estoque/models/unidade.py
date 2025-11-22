from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.session import Base


class Unidade(Base):
    __tablename__ = "unidades"

    id = Column(Integer, primary_key=True, index=True)
    sigla = Column(String(10), nullable=False, unique=True, index=True)
    descricao = Column(String(100), nullable=False)
    tipo_medida = Column(String(20), nullable=False, server_default='Quantidade')  # Quantidade, Peso, Volume, Comprimento, Area, Outros
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Unidade(id={self.id}, sigla='{self.sigla}', descricao='{self.descricao}')>"
