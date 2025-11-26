from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.base import CRUDBase
from app.modules.estoque.models.ajuste_estoque import AjusteEstoque, AjusteEstoqueItem
from app.modules.estoque.schemas.ajuste_estoque import AjusteEstoqueCreate, AjusteEstoqueUpdate
from app.modules.configuracoes.services import sequencia_service
from app.modules.estoque.schemas.movimentacao import MovimentacaoCreate, TipoMovimentacao
from app.modules.estoque.services.estoque_service import EstoqueService


class AjusteEstoqueRepository(CRUDBase[AjusteEstoque, AjusteEstoqueCreate, AjusteEstoqueUpdate]):
    def __init__(self):
        super().__init__(AjusteEstoque)
    
    def get_by_empresa(self, db: Session, empresa_id: int, skip: int = 0, limit: int = 100) -> List[AjusteEstoque]:
        return db.query(self.model).filter(
            AjusteEstoque.empresa_id == empresa_id
        ).offset(skip).limit(limit).all()
    
    def get_by_numero(self, db: Session, numero: str) -> Optional[AjusteEstoque]:
        return db.query(self.model).filter(
            AjusteEstoque.numero == numero
        ).first()
    
    def create_with_itens(self, db: Session, obj_in: AjusteEstoqueCreate) -> AjusteEstoque:
        """Cria um ajuste com seus itens - gera número da sequência dentro da transação"""
        try:
            # Gerar número da sequência dentro da transação
            resultado = sequencia_service.obter_proximo_numero(
                db=db,
                empresa_id=obj_in.empresa_id,
                documento_tipo="ESTOQUE_AJUSTE",
                serie=obj_in.serie
            )
            
            # Preparar dados do ajuste
            itens_data = obj_in.itens if obj_in.itens else []
            obj_data = obj_in.model_dump(exclude={'itens'})
            obj_data['numero'] = resultado['numero']
            obj_data['serie'] = resultado.get('serie')
            
            # Criar ajuste
            db_obj = self.model(**obj_data)
            db.add(db_obj)
            db.flush()  # Get the ID
            
            # Adicionar itens
            for item_data in itens_data:
                item_dict = item_data.model_dump() if hasattr(item_data, 'model_dump') else item_data.dict()
                item_obj = AjusteEstoqueItem(**item_dict, ajuste_id=db_obj.id)
                db.add(item_obj)
            
            db.commit()
            db.refresh(db_obj)
            
            # Processar movimentações e atualizar saldos para cada item
            for item in db_obj.itens:
                # Determinar tipo de movimentação
                tipo_mov = (TipoMovimentacao.AJUSTE_ENTRADA 
                           if db_obj.tipo == 'E' 
                           else TipoMovimentacao.AJUSTE_SAIDA)
                
                # Buscar fator de conversão da embalagem se houver
                quantidade_convertida = item.quantidade
                if item.embalagem_id:
                    from app.modules.estoque.models.embalagem_item import EmbalagemItem
                    embalagem = db.query(EmbalagemItem).filter(EmbalagemItem.id == item.embalagem_id).first()
                    if embalagem:
                        quantidade_convertida = item.quantidade * embalagem.fator_conversao
                
                # Determinar local (usar local padrão do item se não especificado)
                local_id = item.local_id
                if not local_id:
                    from app.modules.estoque.models.item import Item
                    item_obj = db.query(Item).filter(Item.id == item.item_id).first()
                    if item_obj:
                        local_id = item_obj.local_padrao_entrada_id if db_obj.tipo == 'E' else item_obj.local_padrao_saida_id
                
                # Criar movimentação usando a data_entrada do ajuste
                from datetime import datetime, time
                data_movimentacao = datetime.combine(db_obj.data_entrada, time(12, 0, 0)) if db_obj.data_entrada else None
                
                movimentacao_data = MovimentacaoCreate(
                    tipo=tipo_mov,
                    item_id=item.item_id,
                    quantidade=quantidade_convertida,
                    unidade_id=self._get_unidade_from_item(db, item.item_id),
                    lote_id=item.lote_id,
                    local_id=local_id,
                    numero=db_obj.numero,
                    serie=db_obj.serie,
                    custo_unitario=item.valor_unitario,
                    observacoes=item.observacao,
                    data_movimentacao=data_movimentacao
                )
                
                # Processar através do EstoqueService
                EstoqueService.processar_ajuste(db, movimentacao_data)
            
            return db_obj
            
        except Exception as e:
            db.rollback()
            raise
    
    def _get_unidade_from_item(self, db: Session, item_id: int) -> int:
        """Obtém a unidade padrão do item"""
        from app.modules.estoque.models.item import Item
        item = db.query(Item).filter(Item.id == item_id).first()
        return item.unidade_padrao_id if item else None
    
    def update_with_itens(self, db: Session, db_obj: AjusteEstoque, obj_in: AjusteEstoqueUpdate) -> AjusteEstoque:
        """Atualiza um ajuste e seus itens, recalculando movimentações e saldos"""
        try:
            # Armazenar número e série antes da atualização
            numero_antigo = db_obj.numero
            serie_antiga = db_obj.serie
            
            # Atualizar dados do ajuste
            update_data = obj_in.model_dump(exclude_unset=True, exclude={'itens'})
            
            for field, value in update_data.items():
                setattr(db_obj, field, value)
            
            # Se itens foram fornecidos, atualizar
            if obj_in.itens is not None:
                # 1. Excluir movimentações antigas relacionadas a este ajuste
                from app.modules.estoque.models.movimentacao import MovimentacaoEstoque
                from app.modules.estoque.models.saldo import SaldoEstoque
                
                movs_antigas = db.query(MovimentacaoEstoque).filter(
                    MovimentacaoEstoque.numero == numero_antigo,
                    MovimentacaoEstoque.serie == serie_antiga
                ).all()
                
                # Guardar info para reverter saldos
                itens_afetados = [(m.item_id, m.local_id) for m in movs_antigas]
                
                # Excluir movimentações
                for mov in movs_antigas:
                    db.delete(mov)
                
                # 2. Excluir itens antigos do ajuste
                db.query(AjusteEstoqueItem).filter(
                    AjusteEstoqueItem.ajuste_id == db_obj.id
                ).delete()
                
                # 3. Adicionar novos itens
                for item_data in obj_in.itens:
                    item_dict = item_data.model_dump() if hasattr(item_data, 'model_dump') else item_data.dict()
                    item_obj = AjusteEstoqueItem(**item_dict, ajuste_id=db_obj.id)
                    db.add(item_obj)
                
                db.flush()
                
                # 4. Criar novas movimentações
                for item in db_obj.itens:
                    # Determinar tipo de movimentação
                    tipo_mov = (TipoMovimentacao.AJUSTE_ENTRADA 
                               if db_obj.tipo == 'E' 
                               else TipoMovimentacao.AJUSTE_SAIDA)
                    
                    # Buscar fator de conversão da embalagem se houver
                    quantidade_convertida = item.quantidade
                    if item.embalagem_id:
                        from app.modules.estoque.models.embalagem_item import EmbalagemItem
                        embalagem = db.query(EmbalagemItem).filter(EmbalagemItem.id == item.embalagem_id).first()
                        if embalagem:
                            quantidade_convertida = item.quantidade * embalagem.fator_conversao
                    
                    # Determinar local (usar local padrão do item se não especificado)
                    local_id = item.local_id
                    if not local_id:
                        from app.modules.estoque.models.item import Item
                        item_obj = db.query(Item).filter(Item.id == item.item_id).first()
                        if item_obj:
                            local_id = item_obj.local_padrao_entrada_id if db_obj.tipo == 'E' else item_obj.local_padrao_saida_id
                    
                    # Criar movimentação usando a data_entrada do ajuste
                    from datetime import datetime, time
                    data_movimentacao = datetime.combine(db_obj.data_entrada, time(12, 0, 0)) if db_obj.data_entrada else None
                    
                    movimentacao_data = MovimentacaoCreate(
                        tipo=tipo_mov,
                        item_id=item.item_id,
                        quantidade=quantidade_convertida,
                        unidade_id=self._get_unidade_from_item(db, item.item_id),
                        lote_id=item.lote_id,
                        local_id=local_id,
                        numero=db_obj.numero,
                        serie=db_obj.serie,
                        custo_unitario=item.valor_unitario,
                        observacoes=item.observacao,
                        data_movimentacao=data_movimentacao
                    )
                    
                    # Processar através do EstoqueService
                    EstoqueService.processar_ajuste(db, movimentacao_data)
            
            db.commit()
            db.refresh(db_obj)
            return db_obj
            
        except Exception as e:
            db.rollback()
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erro ao atualizar ajuste: {str(e)}", exc_info=True)
            raise

    def remove(self, db: Session, *, id: int) -> Optional[AjusteEstoque]:
        """Remove um ajuste de estoque e limpa movimentações vinculadas ao seu número/série.
        Evita erros de integridade e mantém consistência ao excluir o documento.
        """
        from app.modules.estoque.models.movimentacao import MovimentacaoEstoque
        from app.modules.estoque.repositories.movimentacao import movimentacao_repository

        # Buscar ajuste
        ajuste = db.query(AjusteEstoque).filter(AjusteEstoque.id == id).first()
        if not ajuste:
            return None

        try:
            # Buscar movimentações associadas
            movimentacoes = db.query(MovimentacaoEstoque).filter(
                MovimentacaoEstoque.numero == ajuste.numero,
                MovimentacaoEstoque.serie == ajuste.serie,
                MovimentacaoEstoque.tipo.in_(["AJUSTE_ENTRADA", "AJUSTE_SAIDA"])
            ).all()

            # Excluir cada movimentação usando o repository (para recalcular saldo)
            for mov in movimentacoes:
                # Não commitamos aqui pois o remove do repository já faz commit
                # Vamos fazer manualmente sem commit
                db.expunge(mov)  # Remover do tracking
                
            # Fazer a exclusão manual com recálculo de saldo
            for mov in movimentacoes:
                mov_attached = db.query(MovimentacaoEstoque).filter(MovimentacaoEstoque.id == mov.id).first()
                if mov_attached:
                    # Usar o método remove do repository sem commit automático
                    # Precisamos fazer isso de forma diferente
                    pass

            # Por enquanto, vamos usar a abordagem direta mas adicionar recálculo de saldo
            # Excluir movimentações associadas (por numero/serie/tipo)
            movimentacoes = db.query(MovimentacaoEstoque).filter(
                MovimentacaoEstoque.numero == ajuste.numero,
                MovimentacaoEstoque.serie == ajuste.serie,
                MovimentacaoEstoque.tipo.in_(["AJUSTE_ENTRADA", "AJUSTE_SAIDA"])
            ).all()
            
            # Para cada movimentação, recalcular o saldo antes de excluir
            from app.modules.estoque.models import SaldoEstoque
            from sqlalchemy import and_
            from app.modules.estoque.models.movimentacao import TipoMovimentacao
            
            for movimentacao in movimentacoes:
                # Determinar o delta de quantidade a reverter no saldo
                if movimentacao.tipo in [TipoMovimentacao.ENTRADA, TipoMovimentacao.AJUSTE_ENTRADA]:
                    quantidade_delta = -movimentacao.quantidade
                elif movimentacao.tipo in [TipoMovimentacao.SAIDA, TipoMovimentacao.AJUSTE_SAIDA]:
                    quantidade_delta = movimentacao.quantidade
                else:
                    quantidade_delta = 0
                
                # Recalcular saldo
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
                        
                        if nova_quantidade == 0:
                            db.delete(saldo)
                        else:
                            saldo.quantidade = nova_quantidade
                
                # Excluir a movimentação
                db.delete(movimentacao)

            # Excluir o ajuste (itens serão removidos por FK ondelete CASCADE)
            db.delete(ajuste)
            db.commit()
            return ajuste
        except Exception:
            db.rollback()
            raise


class AjusteEstoqueItemRepository(CRUDBase[AjusteEstoqueItem, dict, dict]):
    def __init__(self):
        super().__init__(AjusteEstoqueItem)
    
    def get_by_ajuste(self, db: Session, ajuste_id: int) -> List[AjusteEstoqueItem]:
        return db.query(self.model).filter(
            AjusteEstoqueItem.ajuste_id == ajuste_id
        ).all()


# Repository instances
ajuste_estoque_repository = AjusteEstoqueRepository()
ajuste_estoque_item_repository = AjusteEstoqueItemRepository()

