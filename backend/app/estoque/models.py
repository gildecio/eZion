from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy import Enum as SAEnum
from app.core.database import Base
from .types import TipoItem


class EstoqueItem(Base):
    __tablename__ = "estoque_items"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(SAEnum(TipoItem, name="tipoitem"), nullable=False, default=TipoItem.PRODUTO)
    quantity = Column(Float, nullable=False, default=0.0)
    location = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
