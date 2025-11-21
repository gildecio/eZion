from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.vendas import crud, schemas

router = APIRouter(prefix="/vendas", tags=["vendas"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/clientes", response_model=schemas.ClienteRead, status_code=201)
def create_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(get_db)):
    return crud.create_cliente(db=db, cliente=cliente)


@router.get("/clientes", response_model=List[schemas.ClienteRead])
def read_clientes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_clientes(db=db, skip=skip, limit=limit)


@router.post("/pedidos", response_model=schemas.PedidoRead, status_code=201)
def create_pedido(pedido: schemas.PedidoCreate, db: Session = Depends(get_db)):
    return crud.create_pedido(db=db, pedido=pedido)


@router.get("/pedidos", response_model=List[schemas.PedidoRead])
def read_pedidos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_pedidos(db=db, skip=skip, limit=limit)


@router.get("/pedidos/{pedido_id}", response_model=schemas.PedidoRead)
def read_pedido(pedido_id: int, db: Session = Depends(get_db)):
    db_pedido = crud.get_pedido(db=db, pedido_id=pedido_id)
    if not db_pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return db_pedido
