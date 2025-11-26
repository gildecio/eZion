"""
Teste de integração para verificar o fluxo completo de:
1. Criar ajuste de estoque
2. Verificar criação de movimentação
3. Verificar criação de saldo
4. Excluir ajuste de estoque
5. Verificar remoção de movimentação
6. Verificar remoção de saldo
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import Base
from app.modules.estoque.repositories.ajuste_estoque import ajuste_estoque_repository
from app.modules.estoque.repositories.movimentacao import movimentacao_repository
from app.modules.estoque.repositories.saldo import saldo_repository
from app.modules.estoque.schemas.ajuste_estoque import AjusteEstoqueCreate, AjusteEstoqueItemCreate
from app.modules.estoque.models import MovimentacaoEstoque, SaldoEstoque, AjusteEstoque
from app.modules.contabil.models import Empresa
from app.modules.estoque.models import Item, Unidade, Local, GrupoItem, TipoItem
from app.modules.configuracoes.models import Sequencia
from datetime import date
from decimal import Decimal


# Configuração do banco de dados de teste em memória
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def test_ajuste_entrada_ciclo_completo(db_session, setup_data):
    """
    Testa o ciclo completo de ajuste de entrada:
    1. Criar ajuste de entrada
    2. Verificar criação de movimentação
    3. Verificar criação de saldo
    4. Excluir ajuste
    5. Verificar remoção de movimentação
    6. Verificar remoção de saldo
    """
    # 1. Criar ajuste de entrada
    ajuste_data = AjusteEstoqueCreate(
        empresa_id=setup_data["empresa_id"],
        data_entrada=date.today(),
        data_registro=date.today(),
        tipo="E",  # Entrada
        valor=Decimal("100.00"),
        serie=None,
        itens=[
            AjusteEstoqueItemCreate(
                item_id=setup_data["item_id"],
                embalagem_id=None,
                quantidade=Decimal("10.000"),
                valor_unitario=Decimal("10.00"),
                valor_total=Decimal("100.00"),
                lote_id=None,
                local_id=setup_data["local_id"],
                observacao="Teste de ajuste de entrada"
            )
        ]
    )
    
    ajuste_criado = ajuste_estoque_repository.create_with_itens(db_session, ajuste_data)
    
    assert ajuste_criado is not None
    assert ajuste_criado.id is not None
    assert ajuste_criado.numero is not None
    print(f"\n✓ Ajuste criado: ID={ajuste_criado.id}, Numero={ajuste_criado.numero}")
    
    # 2. Verificar criação de movimentação
    movimentacoes = db_session.query(MovimentacaoEstoque).filter(
        MovimentacaoEstoque.numero == ajuste_criado.numero
    ).all()
    
    assert len(movimentacoes) == 1, f"Esperado 1 movimentação, encontrado {len(movimentacoes)}"
    assert movimentacoes[0].tipo.value == "AJUSTE_ENTRADA"
    assert movimentacoes[0].quantidade == Decimal("10.000")
    assert movimentacoes[0].item_id == setup_data["item_id"]
    assert movimentacoes[0].local_id == setup_data["local_id"]
    print(f"✓ Movimentação criada: ID={movimentacoes[0].id}, Tipo={movimentacoes[0].tipo.value}, Qtd={movimentacoes[0].quantidade}")
    
    # 3. Verificar criação de saldo
    saldos = db_session.query(SaldoEstoque).filter(
        SaldoEstoque.item_id == setup_data["item_id"],
        SaldoEstoque.local_id == setup_data["local_id"]
    ).all()
    
    assert len(saldos) == 1, f"Esperado 1 saldo, encontrado {len(saldos)}"
    assert saldos[0].quantidade == Decimal("10.000")
    print(f"✓ Saldo criado: ID={saldos[0].id}, Qtd={saldos[0].quantidade}")
    
    # 4. Excluir ajuste
    ajuste_estoque_repository.remove(db_session, id=ajuste_criado.id)
    print(f"✓ Ajuste excluído: ID={ajuste_criado.id}")
    
    # 5. Verificar remoção de movimentação
    movimentacoes_apos = db_session.query(MovimentacaoEstoque).filter(
        MovimentacaoEstoque.numero == ajuste_criado.numero
    ).all()
    
    assert len(movimentacoes_apos) == 0, f"Esperado 0 movimentações após exclusão, encontrado {len(movimentacoes_apos)}"
    print(f"✓ Movimentações removidas: {len(movimentacoes_apos)} encontradas")
    
    # 6. Verificar remoção de saldo
    saldos_apos = db_session.query(SaldoEstoque).filter(
        SaldoEstoque.item_id == setup_data["item_id"],
        SaldoEstoque.local_id == setup_data["local_id"]
    ).all()
    
    # O saldo deve ter sido removido ou zerado
    if len(saldos_apos) > 0:
        assert saldos_apos[0].quantidade == Decimal("0"), f"Esperado saldo 0, encontrado {saldos_apos[0].quantidade}"
        print(f"✓ Saldo zerado: Qtd={saldos_apos[0].quantidade}")
    else:
        print(f"✓ Saldo removido completamente")
    
    print("\n🎉 Teste concluído com sucesso!")


if __name__ == "__main__":
    # Permite executar o teste diretamente
    print("Executando teste de ajuste de estoque...")
    
    # Criar sessão
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    try:
        # Setup
        print("\n1. Configurando dados iniciais...")
        empresa = Empresa(
            id=1,
            cnpj="12345678901234",
            razao_social="Teste ERP",
            ativo=True
        )
        db.add(empresa)
        
        sequencia = Sequencia(
            id=1,
            empresa_id=1,
            documento_tipo="ESTOQUE_AJUSTE",
            serie="AJ",
            numero=1,
            numero_maximo=999999,
            tipo="CONTINUO"
        )
        db.add(sequencia)
        
        grupo = GrupoItem(
            id=1,
            nome="Grupo Teste"
        )
        db.add(grupo)
        
        unidade = Unidade(
            id=1,
            sigla="UN",
            descricao="Unidade",
            tipo_medida="Quantidade"
        )
        db.add(unidade)
        
        local = Local(
            id=1,
            codigo="L001",
            nome="Local Teste",
            ativo=True
        )
        db.add(local)
        
        item = Item(
            id=1,
            codigo="ITEM001",
            descricao="Item Teste",
            tipo=TipoItem.PRODUTO,
            grupo_id=1,
            unidade_padrao_id=1,
            local_padrao_entrada_id=1,
            local_padrao_saida_id=1
        )
        db.add(item)
        
        db.commit()
        
        setup_data = {
            "empresa_id": 1,
            "item_id": 1,
            "unidade_id": 1,
            "local_id": 1
        }
        
        # Executar teste
        print("\n2. Executando teste...")
        test_ajuste_entrada_ciclo_completo(db, setup_data)
        
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
