from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.modules.estoque.schemas import Lote, LoteCreate, LoteUpdate
from app.modules.estoque.repositories import lote_repository

router = APIRouter()


@router.get("/", response_model=List[Lote])
def listar_lotes(
    skip: int = 0,
    limit: int = 100,
    apenas_validos: bool = False,
    db: Session = Depends(get_db)
):
    """Lista todos os lotes ou apenas os válidos (não vencidos)"""
    if apenas_validos:
        return lote_repository.get_validos(db, skip=skip, limit=limit)
    return lote_repository.get_multi(db, skip=skip, limit=limit)


@router.get("/{lote_id}", response_model=Lote)
def buscar_lote(
    lote_id: int,
    db: Session = Depends(get_db)
):
    """Busca um lote por ID"""
    lote = lote_repository.get(db, id=lote_id)
    if not lote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lote não encontrado"
        )
    return lote


@router.post("/", response_model=Lote, status_code=status.HTTP_201_CREATED)
def criar_lote(
    lote_in: LoteCreate,
    db: Session = Depends(get_db)
):
    """Cria um novo lote"""
    # Verificar se já existe um lote com o mesmo código
    lote_existente = lote_repository.get_by_codigo(db, codigo=lote_in.codigo)
    if lote_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um lote com este código"
        )
    
    return lote_repository.create(db, obj_in=lote_in)


@router.put("/{lote_id}", response_model=Lote)
def atualizar_lote(
    lote_id: int,
    lote_in: LoteUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um lote existente"""
    lote = lote_repository.get(db, id=lote_id)
    if not lote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lote não encontrado"
        )
    
    # Se está alterando o código, verificar duplicação
    if lote_in.codigo and lote_in.codigo != lote.codigo:
        lote_existente = lote_repository.get_by_codigo(db, codigo=lote_in.codigo)
        if lote_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe um lote com este código"
            )
    
    return lote_repository.update(db, db_obj=lote, obj_in=lote_in)


@router.delete("/{lote_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_lote(
    lote_id: int,
    db: Session = Depends(get_db)
):
    """Exclui um lote"""
    lote = lote_repository.get(db, id=lote_id)
    if not lote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lote não encontrado"
        )
    
    lote_repository.remove(db, id=lote_id)
    return None
