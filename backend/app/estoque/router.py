from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.estoque import crud, schemas

router = APIRouter(prefix="/estoque", tags=["estoque"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/items", response_model=schemas.EstoqueItemRead, status_code=201)
def create_item(item: schemas.EstoqueItemCreate, db: Session = Depends(get_db)):
    return crud.create_estoque_item(db=db, item=item)


@router.get("/items", response_model=List[schemas.EstoqueItemRead])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_estoque_items(db=db, skip=skip, limit=limit)


@router.get("/items/{item_id}", response_model=schemas.EstoqueItemRead)
def read_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_estoque_item(db=db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="EstoqueItem not found")
    return db_item


@router.put("/items/{item_id}", response_model=schemas.EstoqueItemRead)
def update_item(item_id: int, item: schemas.EstoqueItemCreate, db: Session = Depends(get_db)):
    updated = crud.update_estoque_item(db=db, item_id=item_id, item=item)
    if not updated:
        raise HTTPException(status_code=404, detail="EstoqueItem not found")
    return updated


@router.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_estoque_item(db=db, item_id=item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="EstoqueItem not found")
    return
