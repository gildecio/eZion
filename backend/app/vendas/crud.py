from sqlalchemy.orm import Session
from typing import List, Optional
from app.vendas import models as models_v
from app.contabil import models as models_c
from app.vendas import schemas


def create_cliente(db: Session, cliente: schemas.ClienteCreate) -> models_v.Cliente:
    db_obj = models_v.Cliente(nome=cliente.nome, contato=cliente.contato)
    if cliente.empresa_ids:
        empresas = db.query(models_c.Empresa).filter(models_c.Empresa.id.in_(cliente.empresa_ids)).all()
        for e in empresas:
            db_obj.empresas.append(e)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_cliente(db: Session, cliente_id: int) -> Optional[models_v.Cliente]:
    return db.query(models_v.Cliente).filter(models_v.Cliente.id == cliente_id).first()


def list_clientes(db: Session, skip: int = 0, limit: int = 100) -> List[models_v.Cliente]:
    return db.query(models_v.Cliente).offset(skip).limit(limit).all()


def create_pedido(db: Session, pedido: schemas.PedidoCreate) -> models_v.Pedido:
    db_obj = models_v.Pedido(
        descricao=pedido.descricao,
        valor_total=pedido.valor_total,
        cliente_id=pedido.cliente_id,
    )
    if pedido.empresa_ids:
        empresas = db.query(models_c.Empresa).filter(models_c.Empresa.id.in_(pedido.empresa_ids)).all()
        for e in empresas:
            db_obj.empresas.append(e)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_pedido(db: Session, pedido_id: int) -> Optional[models_v.Pedido]:
    return db.query(models_v.Pedido).filter(models_v.Pedido.id == pedido_id).first()


def list_pedidos(db: Session, skip: int = 0, limit: int = 100) -> List[models_v.Pedido]:
    return db.query(models_v.Pedido).offset(skip).limit(limit).all()
