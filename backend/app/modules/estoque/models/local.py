from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base


class Local(Base):
    __tablename__ = "locais"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(String(255))
    ativo = Column(Boolean, default=True, nullable=False)

    # Relacionamentos
    documento_itens = relationship("DocumentoItem", back_populates="local")

    def __repr__(self):
        return f"<Local(id={self.id}, codigo={self.codigo}, nome={self.nome})>"
