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
    
    # ========== Campos específicos por tipo de documento (nullable) ==========
    
    # Campos para Notas Fiscais (NF_COMPRA, NF_VENDA, NF_DEVOLUCAO_*)
    chave_nfe = Column(String(44), nullable=True, index=True)  # Chave de acesso NFe
    serie = Column(String(10), nullable=True)
    modelo = Column(String(10), nullable=True)
    cnpj_emissor = Column(String(14), nullable=True, index=True)  # CNPJ do emissor
    nome_emissor = Column(String(255), nullable=True)
    cnpj_destinatario = Column(String(14), nullable=True, index=True)  # CNPJ do destinatário
    nome_destinatario = Column(String(255), nullable=True)
    
    # Campos para Transferências (TRANSFERENCIA_ENTRADA, TRANSFERENCIA_SAIDA)
    local_origem_id = Column(Integer, ForeignKey("locais.id"), nullable=True, index=True)
    local_destino_id = Column(Integer, ForeignKey("locais.id"), nullable=True, index=True)
    
    # Campos para Ordem de Produção (ORDEM_PRODUCAO)
    lote_producao = Column(String(50), nullable=True)
    data_inicio_producao = Column(DateTime(timezone=True), nullable=True)
    data_fim_producao = Column(DateTime(timezone=True), nullable=True)
    
    # Campos para Requisição de Material (REQUISICAO_MATERIAL)
    centro_custo = Column(String(50), nullable=True)
    solicitante = Column(String(255), nullable=True)
    ordem_producao_referencia = Column(String(50), nullable=True)
    
    # Campos para Ajustes (AJUSTE_POSITIVO, AJUSTE_NEGATIVO)
    motivo_ajuste = Column(String(500), nullable=True)
    responsavel_ajuste = Column(String(255), nullable=True)
    
    # Campos para Remessa (NOTA_REMESSA)
    data_retorno_prevista = Column(DateTime(timezone=True), nullable=True)
    destinatario_remessa = Column(String(255), nullable=True)
    
    # Campo genérico para observações
    observacoes = Column(String(1000), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="documentos")
    itens = relationship("DocumentoItem", back_populates="documento", cascade="all, delete-orphan")
    local_origem = relationship("Local", foreign_keys=[local_origem_id])
    local_destino = relationship("Local", foreign_keys=[local_destino_id])
    
    # Configuração para Single Table Inheritance
    __mapper_args__ = {
        'polymorphic_on': tipo_documento,
        'polymorphic_identity': 'documento'
    }


# ========== Classes específicas por tipo (STI) ==========

class NotaFiscalCompra(Documento):
    """Nota Fiscal de Compra - Entrada de mercadorias"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.NF_COMPRA
    }


class NotaFiscalVenda(Documento):
    """Nota Fiscal de Venda - Saída de mercadorias"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.NF_VENDA
    }


class NotaFiscalDevolucaoCliente(Documento):
    """Devolução de Cliente - Entrada"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.NF_DEVOLUCAO_CLIENTE
    }


class NotaFiscalDevolucaoFornecedor(Documento):
    """Devolução ao Fornecedor - Saída"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.NF_DEVOLUCAO_FORNECEDOR
    }


class TransferenciaEntrada(Documento):
    """Transferência entre Locais - Entrada"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.TRANSFERENCIA_ENTRADA
    }


class TransferenciaSaida(Documento):
    """Transferência entre Locais - Saída"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.TRANSFERENCIA_SAIDA
    }


class OrdemProducao(Documento):
    """Ordem de Produção"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.ORDEM_PRODUCAO
    }


class RequisicaoMaterial(Documento):
    """Requisição de Material"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.REQUISICAO_MATERIAL
    }


class NotaRemessa(Documento):
    """Nota de Remessa (Consignação/Demonstração)"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.NOTA_REMESSA
    }


class AjustePositivo(Documento):
    """Ajuste de Inventário Positivo"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.AJUSTE_POSITIVO
    }


class AjusteNegativo(Documento):
    """Ajuste de Inventário Negativo"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.AJUSTE_NEGATIVO
    }


class OrdemSeparacao(Documento):
    """Ordem de Separação/Picking"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.ORDEM_SEPARACAO
    }


class OrdemMontagem(Documento):
    """Ordem de Montagem/Desmontagem"""
    __mapper_args__ = {
        'polymorphic_identity': TipoDocumento.ORDEM_MONTAGEM
    }
