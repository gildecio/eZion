from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, date
from app.repositories.base import CRUDBase
from app.modules.estoque.models import MovimentacaoEstoque, TipoMovimentacao
from app.modules.estoque.schemas import MovimentacaoCreate, MovimentacaoUpdate


class MovimentacaoRepository(CRUDBase[MovimentacaoEstoque, MovimentacaoCreate, MovimentacaoUpdate]):
    
    def create(self, db: Session, *, obj_in: MovimentacaoCreate) -> MovimentacaoEstoque:
        """Cria uma nova movimentação"""
        obj_in_data = obj_in.model_dump()
        
        # Se não foi informada a data, usa a data atual
        if 'data_movimentacao' not in obj_in_data or obj_in_data['data_movimentacao'] is None:
            obj_in_data['data_movimentacao'] = datetime.now()
        
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_item(
        self, 
        db: Session, 
        *, 
        item_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[MovimentacaoEstoque]:
        """Busca movimentações de um item específico"""
        return (
            db.query(self.model)
            .filter(self.model.item_id == item_id)
            .order_by(self.model.data_movimentacao.asc(), self.model.id.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_periodo(
        self,
        db: Session,
        *,
        data_inicio: date,
        data_fim: date,
        item_id: Optional[int] = None,
        local_id: Optional[int] = None,
        tipo: Optional[TipoMovimentacao] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[MovimentacaoEstoque]:
        """Busca movimentações por período com filtros opcionais"""
        query = db.query(self.model).filter(
            and_(
                self.model.data_movimentacao >= datetime.combine(data_inicio, datetime.min.time()),
                self.model.data_movimentacao <= datetime.combine(data_fim, datetime.max.time())
            )
        )
        
        if item_id:
            query = query.filter(self.model.item_id == item_id)
        
        if local_id:
            query = query.filter(self.model.local_id == local_id)
        
        if tipo:
            query = query.filter(self.model.tipo == tipo)
        
        return (
            query
            .order_by(self.model.data_movimentacao.asc(), self.model.id.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_filtered(
        self,
        db: Session,
        *,
        item_id: Optional[int] = None,
        local_id: Optional[int] = None,
        tipo: Optional[TipoMovimentacao] = None,
        data_inicio: Optional[date] = None,
        data_fim: Optional[date] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[MovimentacaoEstoque]:
        """Busca movimentações com filtros opcionais (datas, item, local e tipo)."""
        query = db.query(self.model)

        if data_inicio:
            query = query.filter(self.model.data_movimentacao >= datetime.combine(data_inicio, datetime.min.time()))
        if data_fim:
            query = query.filter(self.model.data_movimentacao <= datetime.combine(data_fim, datetime.max.time()))

        if item_id:
            query = query.filter(self.model.item_id == item_id)
        if local_id:
            query = query.filter(self.model.local_id == local_id)
        if tipo:
            query = query.filter(self.model.tipo == tipo)

        return (
            query
            .order_by(self.model.data_movimentacao.asc(), self.model.id.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_lote(
        self,
        db: Session,
        *,
        lote_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[MovimentacaoEstoque]:
        """Busca movimentações de um lote específico"""
        return (
            db.query(self.model)
            .filter(self.model.lote_id == lote_id)
            .order_by(self.model.data_movimentacao.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def remove(self, db: Session, *, id: int) -> Optional[MovimentacaoEstoque]:
        """Remove uma movimentação e recalcula o saldo correspondente"""
        from app.modules.estoque.models import SaldoEstoque
        
        # Buscar a movimentação
        movimentacao = db.query(self.model).filter(self.model.id == id).first()
        if not movimentacao:
            return None
        
        # Determinar o delta de quantidade a reverter no saldo
        # Tipos que AUMENTAM o saldo: ENTRADA, AJUSTE_ENTRADA
        # Tipos que DIMINUEM o saldo: SAIDA, AJUSTE_SAIDA
        if movimentacao.tipo in [TipoMovimentacao.ENTRADA, TipoMovimentacao.AJUSTE_ENTRADA]:
            # Ao excluir uma entrada, diminuímos o saldo
            quantidade_delta = -movimentacao.quantidade
        elif movimentacao.tipo in [TipoMovimentacao.SAIDA, TipoMovimentacao.AJUSTE_SAIDA]:
            # Ao excluir uma saída, aumentamos o saldo
            quantidade_delta = movimentacao.quantidade
        else:
            # Para outros tipos (TRANSFERENCIA, etc), não altera saldo por enquanto
            quantidade_delta = 0
        
        # Buscar ou criar o saldo correspondente
        if quantidade_delta != 0:
            saldo = db.query(SaldoEstoque).filter(
                and_(
                    SaldoEstoque.item_id == movimentacao.item_id,
                    SaldoEstoque.local_id == movimentacao.local_id,
                    SaldoEstoque.lote_id == movimentacao.lote_id
                )
            ).first()
            
            if saldo:
                nova_quantidade = saldo.quantidade + quantidade_delta
                
                # Se a quantidade ficar zerada, remove o saldo
                if nova_quantidade == 0:
                    db.delete(saldo)
                else:
                    # Atualiza a quantidade do saldo
                    saldo.quantidade = nova_quantidade
                    db.add(saldo)
        
        # Excluir a movimentação
        db.delete(movimentacao)
        db.commit()
        
        return movimentacao


movimentacao_repository = MovimentacaoRepository(MovimentacaoEstoque)
