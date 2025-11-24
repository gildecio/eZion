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
                tipo_mov = (TipoMovimentacao.Ajuste_Entrada 
                           if db_obj.tipo == 'E' 
                           else TipoMovimentacao.Ajuste_Saida)
                
                # Buscar fator de conversão da embalagem se houver
                quantidade_convertida = item.quantidade
                if item.embalagem_id:
                    from app.modules.estoque.models.embalagem_item import EmbalagemItem
                    embalagem = db.query(EmbalagemItem).filter(EmbalagemItem.id == item.embalagem_id).first()
                    if embalagem:
                        quantidade_convertida = item.quantidade * embalagem.fator_conversao
                
                # Criar movimentação
                movimentacao_data = MovimentacaoCreate(
                    tipo=tipo_mov,
                    item_id=item.item_id,
                    quantidade=quantidade_convertida,
                    unidade_id=self._get_unidade_from_item(db, item.item_id),
                    lote_id=item.lote_id,
                    local_destino_id=item.local_id if db_obj.tipo == 'E' else None,
                    local_origem_id=item.local_id if db_obj.tipo == 'S' else None,
                    numero=db_obj.numero,
                    serie=db_obj.serie,
                    custo_unitario=item.valor_unitario,
                    observacoes=item.observacao
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
        """Atualiza um ajuste e seus itens"""
        update_data = obj_in.model_dump(exclude_unset=True, exclude={'itens'})
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        # Update items if provided
        if obj_in.itens is not None:
            # Remove existing items
            db.query(AjusteEstoqueItem).filter(
                AjusteEstoqueItem.ajuste_id == db_obj.id
            ).delete()
            
            # Add new items
            for item_data in obj_in.itens:
                item_dict = item_data.model_dump() if hasattr(item_data, 'model_dump') else item_data.dict()
                item_obj = AjusteEstoqueItem(**item_dict, ajuste_id=db_obj.id)
                db.add(item_obj)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj


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

