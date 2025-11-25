from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

from app.db.session import get_db
from app.modules.estoque.schemas import (
    Movimentacao, MovimentacaoCreate, MovimentacaoUpdate,
    TipoMovimentacao
)
from app.modules.estoque.repositories import movimentacao_repository, saldo_repository
from app.modules.estoque.services.estoque_service import estoque_service
from app.modules.estoque.models import MovimentacaoEstoque

router = APIRouter()


def calcular_saldos_movimentacoes(
    db: Session, 
    movimentacoes: List[MovimentacaoEstoque],
    item_id: Optional[int] = None,
    local_id: Optional[int] = None,
    data_inicio: Optional[date] = None
) -> List[Movimentacao]:
    """Calcula saldo_anterior e saldo_atual de forma sequencial sobre a lista exibida.

    Regras:
    - Tipos de entrada somam: ENTRADA, AJUSTE_ENTRADA, INVENTARIO, PRODUCAO, DEVOLUCAO
    - Tipos de saída subtraem: SAIDA, AJUSTE_SAIDA, TRANSFERENCIA
    - Saldo inicial calculado antes do período/filtro exibido
    - Saldo atualizado sequencialmente linha a linha na ordem exibida
    """
    tipos_entrada = {'ENTRADA', 'AJUSTE_ENTRADA', 'INVENTARIO', 'PRODUCAO', 'DEVOLUCAO'}
    tipos_saida = {'SAIDA', 'AJUSTE_SAIDA', 'TRANSFERENCIA'}

    # Calcular saldo inicial (antes da primeira movimentação exibida)
    saldo_inicial = Decimal('0')
    if movimentacoes and item_id:
        primeira_data = movimentacoes[0].data_movimentacao
        
        # Buscar todas as movimentações anteriores à primeira exibida
        query = db.query(MovimentacaoEstoque).filter(
            MovimentacaoEstoque.item_id == item_id,
            MovimentacaoEstoque.data_movimentacao < primeira_data
        )
        
        # Se filtrou por local, considerar apenas esse local no saldo inicial
        if local_id:
            query = query.filter(MovimentacaoEstoque.local_id == local_id)
        
        movs_anteriores = query.order_by(MovimentacaoEstoque.data_movimentacao).all()
        
        for mov_ant in movs_anteriores:
            tipo_val = mov_ant.tipo.value if hasattr(mov_ant.tipo, 'value') else str(mov_ant.tipo)
            if tipo_val in tipos_entrada:
                saldo_inicial += mov_ant.quantidade
            elif tipo_val in tipos_saida:
                saldo_inicial -= mov_ant.quantidade

    # Aplicar movimentações sequencialmente
    saldo_atual = saldo_inicial
    resultado: List[Movimentacao] = []

    for mov in movimentacoes:
        saldo_anterior = saldo_atual

        # Ajustar saldo conforme tipo
        tipo_val = mov.tipo.value if hasattr(mov.tipo, 'value') else str(mov.tipo)
        if tipo_val in tipos_entrada:
            saldo_atual = saldo_anterior + mov.quantidade
        elif tipo_val in tipos_saida:
            saldo_atual = saldo_anterior - mov.quantidade
        else:
            # Tipos desconhecidos não alteram saldo
            saldo_atual = saldo_anterior

        mov_dict = {
            "id": mov.id,
            "tipo": mov.tipo,
            "item_id": mov.item_id,
            "item_codigo": mov.item.codigo if mov.item else None,
            "item_nome": mov.item.descricao if mov.item else None,
            "quantidade": mov.quantidade,
            "unidade_id": mov.unidade_id,
            "unidade_sigla": mov.unidade.sigla if mov.unidade else None,
            "lote_id": mov.lote_id,
            "lote_codigo": mov.lote.codigo if mov.lote else None,
            "local_id": mov.local_id,
            "local_nome": mov.local.nome if mov.local else None,
            "data_movimentacao": mov.data_movimentacao,
            "numero": mov.numero,
            "serie": mov.serie,
            "observacoes": mov.observacoes,
            "custo_unitario": mov.custo_unitario,
            "usuario": mov.usuario,
            "created_at": mov.created_at,
            "updated_at": mov.updated_at,
            "saldo_anterior": saldo_anterior,
            "saldo_atual": saldo_atual,
        }

        resultado.append(Movimentacao(**mov_dict))

    return resultado


@router.get("/", response_model=List[Movimentacao])
def listar_movimentacoes(
    skip: int = 0,
    limit: int = 100,
    item_id: Optional[int] = Query(None, description="Filtrar por item"),
    local_id: Optional[int] = Query(None, description="Filtrar por local (origem ou destino)"),
    tipo: Optional[TipoMovimentacao] = Query(None, description="Filtrar por tipo de movimentação"),
    data_inicio: Optional[date] = Query(None, description="Data inicial"),
    data_fim: Optional[date] = Query(None, description="Data final"),
    db: Session = Depends(get_db)
):
    """Lista movimentações com filtros opcionais combináveis (datas, item, local, tipo)."""
    movimentacoes = movimentacao_repository.get_filtered(
        db,
        item_id=item_id,
        local_id=local_id,
        tipo=tipo,
        data_inicio=data_inicio,
        data_fim=data_fim,
        skip=skip,
        limit=limit,
    )

    return calcular_saldos_movimentacoes(db, movimentacoes, item_id, local_id, data_inicio)


@router.get("/{movimentacao_id}", response_model=Movimentacao)
def buscar_movimentacao(
    movimentacao_id: int,
    db: Session = Depends(get_db)
):
    """Busca uma movimentação por ID"""
    movimentacao = movimentacao_repository.get(db, id=movimentacao_id)
    if not movimentacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimentação não encontrada"
        )
    return movimentacao


@router.post("/", response_model=Movimentacao, status_code=status.HTTP_201_CREATED)
def criar_movimentacao(
    movimentacao_in: MovimentacaoCreate,
    db: Session = Depends(get_db)
):
    """
    Cria uma nova movimentação de estoque.
    Valida e atualiza automaticamente os saldos.
    """
    return estoque_service.processar_movimentacao(db, movimentacao_in)


@router.put("/{movimentacao_id}", response_model=Movimentacao)
def atualizar_movimentacao(
    movimentacao_id: int,
    movimentacao_in: MovimentacaoUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza observações e documento de uma movimentação.
    Não permite alterar quantidades ou locais (para evitar inconsistências no saldo).
    """
    movimentacao = movimentacao_repository.get(db, id=movimentacao_id)
    if not movimentacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimentação não encontrada"
        )
    
    return movimentacao_repository.update(db, db_obj=movimentacao, obj_in=movimentacao_in)


@router.delete("/{movimentacao_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_movimentacao(
    movimentacao_id: int,
    db: Session = Depends(get_db)
):
    """
    Exclui uma movimentação.
    ATENÇÃO: Não reverte automaticamente o saldo. Use com cautela.
    """
    movimentacao = movimentacao_repository.get(db, id=movimentacao_id)
    if not movimentacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimentação não encontrada"
        )
    
    movimentacao_repository.remove(db, id=movimentacao_id)
    return None
