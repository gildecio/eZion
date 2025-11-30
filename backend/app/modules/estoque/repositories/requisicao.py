from app.repositories.base import CRUDBase
from app.modules.estoque.models.requisicao import Requisicao, RequisicaoItem
from app.modules.estoque.schemas.requisicao import RequisicaoCreate, RequisicaoUpdate
from sqlalchemy.orm import Session
from typing import List


class RequisicaoRepository(CRUDBase[Requisicao, RequisicaoCreate, RequisicaoUpdate]):
    def create_with_items(self, db: Session, obj_in: RequisicaoCreate) -> Requisicao:
        requisicao = Requisicao(
            solicitante=obj_in.solicitante,
            local_id=obj_in.local_id,
            status="ABERTA"
        )
        db.add(requisicao)
        db.flush()
        for item in obj_in.itens:
            requisicao_item = RequisicaoItem(
                requisicao_id=requisicao.id,
                item_id=item.item_id,
                embalagem_id=item.embalagem_id,
                quantidade=item.quantidade,
                atendida=0
            )
            db.add(requisicao_item)
        db.commit()
        db.refresh(requisicao)
        return requisicao

    def get_by_status(self, db: Session, status: str) -> List[Requisicao]:
        return db.query(Requisicao).filter(Requisicao.status == status).all()

    def get_by_filters(self, db: Session, filtros: dict) -> List[Requisicao]:
        query = db.query(Requisicao)
        if filtros.get('numero'):
            query = query.filter(Requisicao.id == filtros['numero'])
        if filtros.get('serie'):
            # Adapte conforme o campo real de série
            if hasattr(Requisicao, 'serie'):
                query = query.filter(Requisicao.serie == filtros['serie'])
        if filtros.get('local_id'):
            query = query.filter(Requisicao.local_id == filtros['local_id'])
        if filtros.get('data_inicio'):
            query = query.filter(Requisicao.data_requisicao >= filtros['data_inicio'])
        if filtros.get('data_fim'):
            query = query.filter(Requisicao.data_requisicao <= filtros['data_fim'])
        if filtros.get('status'):
            query = query.filter(Requisicao.status == filtros['status'])
        return query.all()

requisicao_repository = RequisicaoRepository(Requisicao)
