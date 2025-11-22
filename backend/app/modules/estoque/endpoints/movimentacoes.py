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


def calcular_saldos_movimentacoes(db: Session, movimentacoes: List[MovimentacaoEstoque]) -> List[Movimentacao]:
    """Calcula saldo_anterior e saldo_atual para cada movimentação"""
    resultado = []
    
    for mov in movimentacoes:
        # Converter para dict do schema
        mov_dict = {
            "id": mov.id,
            "tipo": mov.tipo,
            "item_id": mov.item_id,
            "quantidade": mov.quantidade,
            "unidade_id": mov.unidade_id,
            "lote_id": mov.lote_id,
            "local_origem_id": mov.local_origem_id,
            "local_destino_id": mov.local_destino_id,
            "data_movimentacao": mov.data_movimentacao,
            "documento": mov.documento,
            "observacoes": mov.observacoes,
            "custo_unitario": mov.custo_unitario,
            "usuario": mov.usuario,
            "created_at": mov.created_at,
            "updated_at": mov.updated_at,
        }
        
        # Calcular saldos baseado no tipo de movimentação
        local_id = None
        if mov.tipo.value in ['Entrada', 'Ajuste Positivo']:
            local_id = mov.local_destino_id
        elif mov.tipo.value in ['Saida', 'Ajuste Negativo']:
            local_id = mov.local_origem_id
        elif mov.tipo.value == 'Transferencia':
            local_id = mov.local_origem_id  # Mostra saldo da origem
        
        if local_id:
            # Buscar todas as movimentações anteriores para calcular saldo
            movs_anteriores = db.query(MovimentacaoEstoque).filter(
                and_(
                    MovimentacaoEstoque.item_id == mov.item_id,
                    MovimentacaoEstoque.data_movimentacao < mov.data_movimentacao,
                    or_(
                        MovimentacaoEstoque.local_origem_id == local_id,
                        MovimentacaoEstoque.local_destino_id == local_id
                    )
                )
            ).order_by(MovimentacaoEstoque.data_movimentacao).all()
            
            # Calcular saldo anterior
            saldo_anterior = Decimal('0')
            for mov_ant in movs_anteriores:
                if mov_ant.tipo.value in ['Entrada', 'Ajuste Positivo'] and mov_ant.local_destino_id == local_id:
                    saldo_anterior += mov_ant.quantidade
                elif mov_ant.tipo.value in ['Saida', 'Ajuste Negativo'] and mov_ant.local_origem_id == local_id:
                    saldo_anterior -= mov_ant.quantidade
                elif mov_ant.tipo.value == 'Transferencia':
                    if mov_ant.local_destino_id == local_id:
                        saldo_anterior += mov_ant.quantidade
                    elif mov_ant.local_origem_id == local_id:
                        saldo_anterior -= mov_ant.quantidade
            
            # Calcular saldo atual
            saldo_atual = saldo_anterior
            if mov.tipo.value in ['Entrada', 'Ajuste Positivo'] and mov.local_destino_id == local_id:
                saldo_atual += mov.quantidade
            elif mov.tipo.value in ['Saida', 'Ajuste Negativo'] and mov.local_origem_id == local_id:
                saldo_atual -= mov.quantidade
            elif mov.tipo.value == 'Transferencia' and mov.local_origem_id == local_id:
                saldo_atual -= mov.quantidade
            
            mov_dict["saldo_anterior"] = saldo_anterior
            mov_dict["saldo_atual"] = saldo_atual
        
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
    """Lista movimentações com filtros opcionais"""
    if data_inicio and data_fim:
        movimentacoes = movimentacao_repository.get_by_periodo(
            db,
            data_inicio=data_inicio,
            data_fim=data_fim,
            item_id=item_id,
            local_id=local_id,
            tipo=tipo,
            skip=skip,
            limit=limit
        )
    elif item_id:
        movimentacoes = movimentacao_repository.get_by_item(db, item_id=item_id, skip=skip, limit=limit)
    else:
        movimentacoes = movimentacao_repository.get_multi(db, skip=skip, limit=limit)
    
    return calcular_saldos_movimentacoes(db, movimentacoes)


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
