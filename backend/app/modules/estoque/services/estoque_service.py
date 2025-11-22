from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
from decimal import Decimal
from datetime import datetime

from app.modules.estoque.models import TipoMovimentacao
from app.modules.estoque.schemas import MovimentacaoCreate, Movimentacao
from app.modules.estoque.repositories import (
    movimentacao_repository,
    saldo_repository,
    item_repository,
    local_repository,
    lote_repository
)


class EstoqueService:
    """
    Serviço para gerenciar operações de estoque.
    Implementa as regras de negócio e atualiza saldos automaticamente.
    """
    
    @staticmethod
    def validar_movimentacao(
        db: Session,
        movimentacao: MovimentacaoCreate
    ) -> None:
        """Valida se a movimentação pode ser realizada"""
        
        # Validar se o item existe
        item = item_repository.get(db, id=movimentacao.item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item não encontrado"
            )
        
        # Validar locais conforme o tipo de movimentação
        if movimentacao.tipo == TipoMovimentacao.Entrada:
            if not movimentacao.local_destino_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Local de destino é obrigatório para entradas"
                )
            local = local_repository.get(db, id=movimentacao.local_destino_id)
            if not local:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Local de destino não encontrado"
                )
        
        elif movimentacao.tipo == TipoMovimentacao.Saida:
            if not movimentacao.local_origem_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Local de origem é obrigatório para saídas"
                )
            local = local_repository.get(db, id=movimentacao.local_origem_id)
            if not local:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Local de origem não encontrado"
                )
            
            # Verificar saldo disponível
            saldo = saldo_repository.get_or_create(
                db,
                item_id=movimentacao.item_id,
                local_id=movimentacao.local_origem_id,
                lote_id=movimentacao.lote_id
            )
            
            if saldo.quantidade < movimentacao.quantidade:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Saldo insuficiente. Disponível: {saldo.quantidade}, Solicitado: {movimentacao.quantidade}"
                )
        
        elif movimentacao.tipo == TipoMovimentacao.Transferencia:
            if not movimentacao.local_origem_id or not movimentacao.local_destino_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Local de origem e destino são obrigatórios para transferências"
                )
            
            if movimentacao.local_origem_id == movimentacao.local_destino_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Local de origem e destino não podem ser iguais"
                )
            
            # Verificar saldo no local de origem
            saldo = saldo_repository.get_or_create(
                db,
                item_id=movimentacao.item_id,
                local_id=movimentacao.local_origem_id,
                lote_id=movimentacao.lote_id
            )
            
            if saldo.quantidade < movimentacao.quantidade:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Saldo insuficiente no local de origem. Disponível: {saldo.quantidade}"
                )
        
        # Validar lote se informado
        if movimentacao.lote_id:
            lote = lote_repository.get(db, id=movimentacao.lote_id)
            if not lote:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Lote não encontrado"
                )
    
    @staticmethod
    def processar_entrada(
        db: Session,
        movimentacao: MovimentacaoCreate
    ) -> Movimentacao:
        """Processa uma entrada de estoque"""
        EstoqueService.validar_movimentacao(db, movimentacao)
        
        # Criar a movimentação
        mov = movimentacao_repository.create(db, obj_in=movimentacao)
        
        # Atualizar saldo
        saldo_repository.atualizar_saldo(
            db,
            item_id=movimentacao.item_id,
            local_id=movimentacao.local_destino_id,
            lote_id=movimentacao.lote_id,
            quantidade_delta=movimentacao.quantidade,
            custo_unitario=movimentacao.custo_unitario
        )
        
        return mov
    
    @staticmethod
    def processar_saida(
        db: Session,
        movimentacao: MovimentacaoCreate
    ) -> Movimentacao:
        """Processa uma saída de estoque"""
        EstoqueService.validar_movimentacao(db, movimentacao)
        
        # Criar a movimentação
        mov = movimentacao_repository.create(db, obj_in=movimentacao)
        
        # Atualizar saldo (quantidade negativa)
        saldo_repository.atualizar_saldo(
            db,
            item_id=movimentacao.item_id,
            local_id=movimentacao.local_origem_id,
            lote_id=movimentacao.lote_id,
            quantidade_delta=-movimentacao.quantidade
        )
        
        return mov
    
    @staticmethod
    def processar_transferencia(
        db: Session,
        movimentacao: MovimentacaoCreate
    ) -> Movimentacao:
        """Processa uma transferência entre locais"""
        EstoqueService.validar_movimentacao(db, movimentacao)
        
        # Criar a movimentação
        mov = movimentacao_repository.create(db, obj_in=movimentacao)
        
        # Obter custo médio do local de origem
        saldo_origem = saldo_repository.get_or_create(
            db,
            item_id=movimentacao.item_id,
            local_id=movimentacao.local_origem_id,
            lote_id=movimentacao.lote_id
        )
        
        # Diminuir saldo no local de origem
        saldo_repository.atualizar_saldo(
            db,
            item_id=movimentacao.item_id,
            local_id=movimentacao.local_origem_id,
            lote_id=movimentacao.lote_id,
            quantidade_delta=-movimentacao.quantidade
        )
        
        # Aumentar saldo no local de destino (mantendo o custo médio)
        saldo_repository.atualizar_saldo(
            db,
            item_id=movimentacao.item_id,
            local_id=movimentacao.local_destino_id,
            lote_id=movimentacao.lote_id,
            quantidade_delta=movimentacao.quantidade,
            custo_unitario=saldo_origem.custo_medio
        )
        
        return mov
    
    @staticmethod
    def processar_ajuste(
        db: Session,
        movimentacao: MovimentacaoCreate
    ) -> Movimentacao:
        """
        Processa um ajuste de estoque (inventário).
        Pode ser positivo ou negativo.
        """
        EstoqueService.validar_movimentacao(db, movimentacao)
        
        # Criar a movimentação
        mov = movimentacao_repository.create(db, obj_in=movimentacao)
        
        # Determinar o local e a quantidade delta
        if movimentacao.tipo == TipoMovimentacao.Ajuste_Positivo:
            local_id = movimentacao.local_destino_id
            quantidade_delta = movimentacao.quantidade
        else:  # AJUSTE_NEGATIVO
            local_id = movimentacao.local_origem_id
            quantidade_delta = -movimentacao.quantidade
        
        # Atualizar saldo
        saldo_repository.atualizar_saldo(
            db,
            item_id=movimentacao.item_id,
            local_id=local_id,
            lote_id=movimentacao.lote_id,
            quantidade_delta=quantidade_delta,
            custo_unitario=movimentacao.custo_unitario
        )
        
        return mov
    
    @staticmethod
    def processar_movimentacao(
        db: Session,
        movimentacao: MovimentacaoCreate
    ) -> Movimentacao:
        """
        Processa uma movimentação de estoque de acordo com seu tipo.
        Atualiza automaticamente os saldos.
        """
        if movimentacao.tipo == TipoMovimentacao.Entrada:
            return EstoqueService.processar_entrada(db, movimentacao)
        
        elif movimentacao.tipo == TipoMovimentacao.Saida:
            return EstoqueService.processar_saida(db, movimentacao)
        
        elif movimentacao.tipo == TipoMovimentacao.Transferencia:
            return EstoqueService.processar_transferencia(db, movimentacao)
        
        elif movimentacao.tipo in [TipoMovimentacao.Ajuste_Positivo, TipoMovimentacao.Ajuste_Negativo]:
            return EstoqueService.processar_ajuste(db, movimentacao)
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de movimentação não implementado: {movimentacao.tipo}"
            )


estoque_service = EstoqueService()
