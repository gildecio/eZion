from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base


class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    razao_social = Column(String(255), nullable=False, index=True)
    cnpj = Column(String(14), unique=True, nullable=False, index=True)
    ativo = Column(Boolean, default=True, nullable=False, index=True)

    # Relacionamentos
    documentos = relationship("Documento", back_populates="empresa")

    def __repr__(self):
        return f"<Empresa(id={self.id}, razao_social='{self.razao_social}', cnpj='{self.cnpj}')>"
