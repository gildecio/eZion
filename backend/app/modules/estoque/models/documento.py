from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class TipoDocumento(str, enum.Enum):
    # Entradas
    NF_COMPRA = "Nota Fiscal de Compra"
    NF_DEVOLUCAO_CLIENTE = "Nota Fiscal de Devolução de Cliente"
    TRANSFERENCIA_ENTRADA = "Transferência entre Locais (Entrada)"
    ORDEM_PRODUCAO = "Ordem de Produção"
    AJUSTE_POSITIVO = "Ajuste de Inventário Positivo"
    
    # Saídas
    NF_VENDA = "Nota Fiscal de Venda"
    NF_DEVOLUCAO_FORNECEDOR = "Nota Fiscal de Devolução ao Fornecedor"
    TRANSFERENCIA_SAIDA = "Transferência entre Locais (Saída)"
    REQUISICAO_MATERIAL = "Requisição de Material"
    NOTA_REMESSA = "Nota de Remessa"
    AJUSTE_NEGATIVO = "Ajuste de Inventário Negativo"
    
    # Internos
    ORDEM_SEPARACAO = "Ordem de Separação"
    ORDEM_MONTAGEM = "Ordem de Montagem/Desmontagem"


class Documento(Base):
    __tablename__ = "documentos"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(50), nullable=False, index=True)
    tipo_documento = Column(SQLEnum(TipoDocumento), nullable=False, index=True)
    data_registro = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    data_entrada = Column(DateTime(timezone=True), nullable=True, index=True)
    valor = Column(Numeric(15, 2), nullable=False)
    
    # Relacionamento com empresa
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="documentos")
    itens = relationship("DocumentoItem", back_populates="documento", cascade="all, delete-orphan")
