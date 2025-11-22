from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.modules.estoque.schemas import Item, ItemCreate, ItemUpdate
from app.modules.estoque.repositories import item_repository

router = APIRouter()


@router.get("/", response_model=List[Item])
def listar_itens(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista todos os itens"""
    itens = item_repository.get_multi(db, skip=skip, limit=limit)
    return itens


@router.get("/{item_id}", response_model=Item)
def buscar_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Busca um item por ID"""
    item = item_repository.get(db, id=item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item não encontrado"
        )
    return item


@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
def criar_item(
    item_in: ItemCreate,
    db: Session = Depends(get_db)
):
    """Cria um novo item"""
    item = item_repository.create(db, obj_in=item_in)
    return item


@router.put("/{item_id}", response_model=Item)
def atualizar_item(
    item_id: int,
    item_in: ItemUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um item existente"""
    item = item_repository.get(db, id=item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item não encontrado"
        )
    item = item_repository.update(db, db_obj=item, obj_in=item_in)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Exclui um item"""
    item = item_repository.get(db, id=item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item não encontrado"
        )
    item_repository.remove(db, id=item_id)
