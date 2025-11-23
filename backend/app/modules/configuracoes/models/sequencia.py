from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum


class TipoSequencia(str, enum.Enum):
    ANUAL = "ANUAL"      # Reseta número e atualiza série para ano atual
    CONTINUO = "CONTINUO" # Incrementa série quando atinge número máximo


class Sequencia(Base):
    __tablename__ = "sequencias"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    documento_tipo = Column(String(50), nullable=False, index=True)
    numero = Column(Integer, nullable=False, default=1)
    serie = Column(String(10), nullable=True)
    numero_maximo = Column(Integer, nullable=False, default=999999)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    tipo = Column(SQLEnum(TipoSequencia), nullable=False, default=TipoSequencia.CONTINUO)

    def __repr__(self):
        return f"<Sequencia(id={self.id}, documento_tipo='{self.documento_tipo}', serie='{self.serie}', numero={self.numero})>"
