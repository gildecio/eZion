from sqlalchemy.orm import Session
from typing import List, Optional
from app.estoque import models, schemas


def create_estoque_item(db: Session, item: schemas.EstoqueItemCreate) -> models.EstoqueItem:
    db_obj = models.EstoqueItem(
        tipo=item.tipo,
        quantity=item.quantity,
        location=item.location,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_estoque_item(db: Session, item_id: int) -> Optional[models.EstoqueItem]:
    return db.query(models.EstoqueItem).filter(models.EstoqueItem.id == item_id).first()


def list_estoque_items(db: Session, skip: int = 0, limit: int = 100) -> List[models.EstoqueItem]:
    return db.query(models.EstoqueItem).offset(skip).limit(limit).all()


def update_estoque_item(db: Session, item_id: int, item: schemas.EstoqueItemCreate) -> Optional[models.EstoqueItem]:
    db_obj = db.query(models.EstoqueItem).filter(models.EstoqueItem.id == item_id).first()
    if not db_obj:
        return None
    db_obj.tipo = item.tipo
    db_obj.quantity = item.quantity
    db_obj.location = item.location
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_estoque_item(db: Session, item_id: int) -> bool:
    db_obj = db.query(models.EstoqueItem).filter(models.EstoqueItem.id == item_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
