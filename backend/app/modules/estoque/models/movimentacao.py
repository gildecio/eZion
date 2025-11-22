from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class TipoMovimentacao(str, enum.Enum):
    Entrada = "Entrada"
    Saida = "Saida"
    Transferencia = "Transferencia"
    Ajuste_Positivo = "Ajuste Positivo"
    Ajuste_Negativo = "Ajuste Negativo"
    Inventario = "Inventario"
    Producao = "Producao"
    Devolucao = "Devolucao"


class MovimentacaoEstoque(Base):
    __tablename__ = "movimentacoes_estoque"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(SQLEnum(TipoMovimentacao), nullable=False, index=True)
    
    # Relacionamento com item
    item_id = Column(Integer, ForeignKey("itens.id"), nullable=False, index=True)
    
    # Quantidade e unidade
    quantidade = Column(Numeric(15, 4), nullable=False)
    unidade_id = Column(Integer, ForeignKey("unidades.id"), nullable=False)
    
    # Lote (opcional)
    lote_id = Column(Integer, ForeignKey("lotes.id"), nullable=True, index=True)
    
    # Local de origem (para transferências e saídas)
    local_origem_id = Column(Integer, ForeignKey("locais.id"), nullable=True, index=True)
    
    # Local de destino (para entradas e transferências)
    local_destino_id = Column(Integer, ForeignKey("locais.id"), nullable=True, index=True)
    
    # Dados da movimentação
    data_movimentacao = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    documento = Column(String(50), nullable=True, index=True)  # Nota fiscal, número do pedido, etc.
    observacoes = Column(Text, nullable=True)
    
    # Custo unitário (para entradas)
    custo_unitario = Column(Numeric(15, 4), nullable=True)
    
    # Controle de usuário
    usuario = Column(String(100), nullable=True)  # Pode ser integrado com sistema de autenticação
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    item = relationship("Item")
    unidade = relationship("Unidade")
    lote = relationship("Lote")
    local_origem = relationship("Local", foreign_keys=[local_origem_id])
    local_destino = relationship("Local", foreign_keys=[local_destino_id])

    def __repr__(self):
        return f"<MovimentacaoEstoque(id={self.id}, tipo='{self.tipo}', item_id={self.item_id}, qtd={self.quantidade})>"
