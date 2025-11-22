from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from decimal import Decimal

from app.db.session import get_db
from app.modules.estoque.schemas import Saldo, SaldoDetalhado
from app.modules.estoque.repositories import saldo_repository
from app.modules.estoque.models import SaldoEstoque, Item, Local, Lote, Unidade

router = APIRouter()


@router.get("/", response_model=List[SaldoDetalhado])
def consultar_saldos(
    item_id: Optional[int] = Query(None, description="Filtrar por item"),
    local_id: Optional[int] = Query(None, description="Filtrar por local"),
    lote_id: Optional[int] = Query(None, description="Filtrar por lote"),
    apenas_com_saldo: bool = Query(True, description="Mostrar apenas itens com saldo > 0"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Consulta saldos de estoque com filtros opcionais.
    Retorna informações detalhadas incluindo dados do item, local e lote.
    """
    # Buscar saldos
    saldos = saldo_repository.get_com_filtros(
        db,
        item_id=item_id,
        local_id=local_id,
        lote_id=lote_id,
        apenas_com_saldo=apenas_com_saldo,
        skip=skip,
        limit=limit
    )
    
    # Enriquecer com dados relacionados
    resultado = []
    for saldo in saldos:
        # Fazer join manual para obter dados relacionados
        query = (
            db.query(
                SaldoEstoque,
                Item.codigo.label('item_codigo'),
                Item.descricao.label('item_descricao'),
                Local.codigo.label('local_codigo'),
                Local.nome.label('local_nome'),
                Lote.codigo.label('lote_codigo'),
                Unidade.sigla.label('unidade_padrao_sigla')
            )
            .join(Item, SaldoEstoque.item_id == Item.id)
            .join(Local, SaldoEstoque.local_id == Local.id)
            .outerjoin(Lote, SaldoEstoque.lote_id == Lote.id)
            .outerjoin(Unidade, Item.unidade_padrao_id == Unidade.id)
            .filter(SaldoEstoque.id == saldo.id)
        )
        
        row = query.first()
        
        if row:
            saldo_dict = {
                "id": row.SaldoEstoque.id,
                "item_id": row.SaldoEstoque.item_id,
                "local_id": row.SaldoEstoque.local_id,
                "lote_id": row.SaldoEstoque.lote_id,
                "quantidade": row.SaldoEstoque.quantidade,
                "custo_medio": row.SaldoEstoque.custo_medio,
                "ultima_atualizacao": row.SaldoEstoque.ultima_atualizacao,
                "created_at": row.SaldoEstoque.created_at,
                "updated_at": row.SaldoEstoque.updated_at,
                "item_codigo": row.item_codigo,
                "item_descricao": row.item_descricao,
                "local_codigo": row.local_codigo,
                "local_nome": row.local_nome,
                "lote_codigo": row.lote_codigo,
                "unidade_padrao_sigla": row.unidade_padrao_sigla,
                "valor_total": (row.SaldoEstoque.quantidade * (row.SaldoEstoque.custo_medio or Decimal(0)))
            }
            resultado.append(saldo_dict)
    
    return resultado


@router.get("/{saldo_id}", response_model=Saldo)
def buscar_saldo(
    saldo_id: int,
    db: Session = Depends(get_db)
):
    """Busca um saldo específico por ID"""
    saldo = saldo_repository.get(db, id=saldo_id)
    if not saldo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saldo não encontrado"
        )
    return saldo


@router.get("/item/{item_id}", response_model=List[Saldo])
def consultar_saldo_por_item(
    item_id: int,
    apenas_com_saldo: bool = Query(True, description="Mostrar apenas com saldo > 0"),
    db: Session = Depends(get_db)
):
    """Consulta todos os saldos de um item em diferentes locais/lotes"""
    return saldo_repository.get_by_item(db, item_id=item_id, apenas_com_saldo=apenas_com_saldo)


@router.get("/local/{local_id}", response_model=List[Saldo])
def consultar_saldo_por_local(
    local_id: int,
    apenas_com_saldo: bool = Query(True, description="Mostrar apenas com saldo > 0"),
    db: Session = Depends(get_db)
):
    """Consulta todos os saldos em um local específico"""
    return saldo_repository.get_by_local(db, local_id=local_id, apenas_com_saldo=apenas_com_saldo)


@router.get("/lote/{lote_id}", response_model=List[Saldo])
def consultar_saldo_por_lote(
    lote_id: int,
    db: Session = Depends(get_db)
):
    """Consulta todos os saldos de um lote específico"""
    return saldo_repository.get_by_lote(db, lote_id=lote_id)
