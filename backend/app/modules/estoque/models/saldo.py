from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class SaldoEstoque(Base):
    """
    Controla o saldo atual de estoque por item, local e lote.
    Esta tabela é atualizada automaticamente pelas movimentações.
    """
    __tablename__ = "saldos_estoque"

    id = Column(Integer, primary_key=True, index=True)
    
    # Chave composta: item + local + lote
    item_id = Column(Integer, ForeignKey("itens.id"), nullable=False, index=True)
    local_id = Column(Integer, ForeignKey("locais.id"), nullable=False, index=True)
    lote_id = Column(Integer, ForeignKey("lotes.id"), nullable=True, index=True)
    
    # Quantidade em estoque (na unidade padrão do item)
    quantidade = Column(Numeric(15, 4), nullable=False, default=0)
    
    # Valor médio de custo (para cálculo de estoque em valor)
    custo_medio = Column(Numeric(15, 4), nullable=True, default=0)
    
    # Controle de atualização
    ultima_atualizacao = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    item = relationship("Item")
    local = relationship("Local")
    lote = relationship("Lote")

    # Constraint de unicidade: não pode haver dois saldos para o mesmo item+local+lote
    __table_args__ = (
        UniqueConstraint('item_id', 'local_id', 'lote_id', name='uq_saldo_item_local_lote'),
    )

    def __repr__(self):
        return f"<SaldoEstoque(item_id={self.item_id}, local_id={self.local_id}, lote_id={self.lote_id}, qtd={self.quantidade})>"
