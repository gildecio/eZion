from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from decimal import Decimal
from app.repositories.base import CRUDBase
from app.modules.estoque.models import SaldoEstoque
from app.modules.estoque.schemas import SaldoCreate, SaldoUpdate


class SaldoRepository(CRUDBase[SaldoEstoque, SaldoCreate, SaldoUpdate]):
    
    def get_or_create(
        self,
        db: Session,
        *,
        item_id: int,
        local_id: int,
        lote_id: Optional[int] = None
    ) -> SaldoEstoque:
        """Busca ou cria um saldo para o item, local e lote especificados"""
        saldo = db.query(self.model).filter(
            and_(
                self.model.item_id == item_id,
                self.model.local_id == local_id,
                self.model.lote_id == lote_id
            )
        ).first()
        
        if not saldo:
            saldo_data = SaldoCreate(
                item_id=item_id,
                local_id=local_id,
                lote_id=lote_id,
                quantidade=Decimal(0),
                custo_medio=Decimal(0)
            )
            saldo = self.create(db, obj_in=saldo_data)
        
        return saldo
    
    def atualizar_saldo(
        self,
        db: Session,
        *,
        item_id: int,
        local_id: int,
        lote_id: Optional[int],
        quantidade_delta: Decimal,
        custo_unitario: Optional[Decimal] = None
    ) -> SaldoEstoque:
        """
        Atualiza o saldo de um item.
        quantidade_delta: positivo para entrada, negativo para saída
        """
        saldo = self.get_or_create(db, item_id=item_id, local_id=local_id, lote_id=lote_id)
        
        nova_quantidade = saldo.quantidade + quantidade_delta
        
        # Atualizar custo médio se for entrada com custo informado
        if custo_unitario and quantidade_delta > 0:
            valor_anterior = saldo.quantidade * (saldo.custo_medio or Decimal(0))
            valor_entrada = quantidade_delta * custo_unitario
            valor_total = valor_anterior + valor_entrada
            
            if nova_quantidade > 0:
                novo_custo_medio = valor_total / nova_quantidade
            else:
                novo_custo_medio = saldo.custo_medio or Decimal(0)
            
            saldo.custo_medio = novo_custo_medio
        
        saldo.quantidade = nova_quantidade
        db.commit()
        db.refresh(saldo)
        
        return saldo
    
    def get_by_item(
        self,
        db: Session,
        *,
        item_id: int,
        apenas_com_saldo: bool = False
    ) -> List[SaldoEstoque]:
        """Busca todos os saldos de um item em diferentes locais/lotes"""
        query = db.query(self.model).filter(self.model.item_id == item_id)
        
        if apenas_com_saldo:
            query = query.filter(self.model.quantidade > 0)
        
        return query.all()
    
    def get_by_local(
        self,
        db: Session,
        *,
        local_id: int,
        apenas_com_saldo: bool = False
    ) -> List[SaldoEstoque]:
        """Busca todos os saldos em um local específico"""
        query = db.query(self.model).filter(self.model.local_id == local_id)
        
        if apenas_com_saldo:
            query = query.filter(self.model.quantidade > 0)
        
        return query.all()
    
    def get_by_lote(
        self,
        db: Session,
        *,
        lote_id: int
    ) -> List[SaldoEstoque]:
        """Busca todos os saldos de um lote específico"""
        return db.query(self.model).filter(self.model.lote_id == lote_id).all()
    
    def get_com_filtros(
        self,
        db: Session,
        *,
        item_id: Optional[int] = None,
        local_id: Optional[int] = None,
        lote_id: Optional[int] = None,
        apenas_com_saldo: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> List[SaldoEstoque]:
        """Busca saldos com múltiplos filtros"""
        query = db.query(self.model)
        
        if item_id:
            query = query.filter(self.model.item_id == item_id)
        
        if local_id:
            query = query.filter(self.model.local_id == local_id)
        
        if lote_id:
            query = query.filter(self.model.lote_id == lote_id)
        
        if apenas_com_saldo:
            query = query.filter(self.model.quantidade > 0)
        
        return query.offset(skip).limit(limit).all()


saldo_repository = SaldoRepository(SaldoEstoque)
