from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.estoque.schemas import Unidade, UnidadeCreate, UnidadeUpdate
from app.modules.estoque.repositories import unidade_repository

router = APIRouter(tags=["Unidades"])


@router.get("/", response_model=List[Unidade])
def listar_unidades(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista todas as unidades de medida"""
    unidades = unidade_repository.get_multi(db, skip=skip, limit=limit)
    return unidades


@router.get("/{unidade_id}", response_model=Unidade)
def obter_unidade(unidade_id: int, db: Session = Depends(get_db)):
    """Obtém uma unidade específica"""
    unidade = unidade_repository.get(db, unidade_id)
    if not unidade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unidade com ID {unidade_id} não encontrada"
        )
    return unidade


@router.post("/", response_model=Unidade, status_code=status.HTTP_201_CREATED)
def criar_unidade(unidade_data: UnidadeCreate, db: Session = Depends(get_db)):
    """Cria uma nova unidade de medida"""
    unidade = unidade_repository.create(db, obj_in=unidade_data)
    return unidade


@router.put("/{unidade_id}", response_model=Unidade)
def atualizar_unidade(
    unidade_id: int,
    unidade_data: UnidadeUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza uma unidade existente"""
    unidade = unidade_repository.get(db, unidade_id)
    if not unidade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unidade com ID {unidade_id} não encontrada"
        )
    
    unidade = unidade_repository.update(db, db_obj=unidade, obj_in=unidade_data)
    return unidade


@router.delete("/{unidade_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_unidade(unidade_id: int, db: Session = Depends(get_db)):
    """Deleta uma unidade"""
    unidade = unidade_repository.get(db, unidade_id)
    if not unidade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unidade com ID {unidade_id} não encontrada"
        )
    
    unidade_repository.remove(db, id=unidade_id)
    return None
