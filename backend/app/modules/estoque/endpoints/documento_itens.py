from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.modules.estoque.schemas.documento_item import (
    DocumentoItem,
    DocumentoItemCreate,
    DocumentoItemUpdate,
)
from app.modules.estoque.repositories import documento_item_repository

router = APIRouter()


@router.get("/", response_model=List[DocumentoItem])
def listar_documento_itens(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista todos os itens de documentos"""
    return documento_item_repository.get_multi(db, skip=skip, limit=limit)


@router.get("/documento/{documento_id}", response_model=List[DocumentoItem])
def listar_itens_por_documento(
    documento_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista todos os itens de um documento específico"""
    return documento_item_repository.get_by_documento(
        db,
        documento_id=documento_id,
        skip=skip,
        limit=limit
    )


@router.get("/item/{item_id}", response_model=List[DocumentoItem])
def listar_documentos_por_item(
    item_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista todos os documentos que contêm um item específico"""
    return documento_item_repository.get_by_item(
        db,
        item_id=item_id,
        skip=skip,
        limit=limit
    )


@router.get("/local/{local_id}", response_model=List[DocumentoItem])
def listar_itens_por_local(
    local_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista todos os itens de documentos de um local específico"""
    return documento_item_repository.get_by_local(
        db,
        local_id=local_id,
        skip=skip,
        limit=limit
    )


@router.get("/{documento_item_id}", response_model=DocumentoItem)
def buscar_documento_item(
    documento_item_id: int,
    db: Session = Depends(get_db)
):
    """Busca um item de documento por ID"""
    documento_item = documento_item_repository.get(db, id=documento_item_id)
    if not documento_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item de documento não encontrado"
        )
    return documento_item


@router.post("/", response_model=DocumentoItem, status_code=status.HTTP_201_CREATED)
def criar_documento_item(
    documento_item_in: DocumentoItemCreate,
    db: Session = Depends(get_db)
):
    """Cria um novo item de documento"""
    return documento_item_repository.create(db, obj_in=documento_item_in)


@router.put("/{documento_item_id}", response_model=DocumentoItem)
def atualizar_documento_item(
    documento_item_id: int,
    documento_item_in: DocumentoItemUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um item de documento"""
    documento_item = documento_item_repository.get(db, id=documento_item_id)
    if not documento_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item de documento não encontrado"
        )
    
    return documento_item_repository.update(db, db_obj=documento_item, obj_in=documento_item_in)


@router.delete("/{documento_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_documento_item(
    documento_item_id: int,
    db: Session = Depends(get_db)
):
    """Exclui um item de documento"""
    documento_item = documento_item_repository.get(db, id=documento_item_id)
    if not documento_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item de documento não encontrado"
        )
    
    documento_item_repository.remove(db, id=documento_item_id)
    return None
