from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.modules.estoque.repositories.ajuste_estoque import ajuste_estoque_repository
from app.modules.estoque.schemas.ajuste_estoque import (
    AjusteEstoqueCreate,
    AjusteEstoqueUpdate,
    AjusteEstoqueInDB
)

router = APIRouter()

@router.get("/", response_model=List[AjusteEstoqueInDB])
def list_ajustes(
    empresa_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista ajustes de estoque"""
    if empresa_id:
        return ajuste_estoque_repository.get_by_empresa(db, empresa_id, skip, limit)
    
    return ajuste_estoque_repository.get_multi(db, skip=skip, limit=limit)

@router.get("/{ajuste_id}", response_model=AjusteEstoqueInDB)
def get_ajuste(ajuste_id: int, db: Session = Depends(get_db)):
    """Busca um ajuste específico"""
    ajuste = ajuste_estoque_repository.get(db, ajuste_id)
    
    if not ajuste:
        raise HTTPException(status_code=404, detail="Ajuste não encontrado")
    
    return ajuste

@router.post("/", response_model=AjusteEstoqueInDB, status_code=201)
def create_ajuste(ajuste: AjusteEstoqueCreate, db: Session = Depends(get_db)):
    """Cria um novo ajuste de estoque com itens"""
    # Verifica se número já existe
    existing = ajuste_estoque_repository.get_by_numero(db, ajuste.numero)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Já existe um ajuste com o número {ajuste.numero}"
        )
    
    return ajuste_estoque_repository.create_with_itens(db, ajuste)

@router.put("/{ajuste_id}", response_model=AjusteEstoqueInDB)
def update_ajuste(
    ajuste_id: int,
    ajuste: AjusteEstoqueUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um ajuste de estoque"""
    db_ajuste = ajuste_estoque_repository.get(db, ajuste_id)
    
    if not db_ajuste:
        raise HTTPException(status_code=404, detail="Ajuste não encontrado")
    
    # Verifica se novo número já existe
    if ajuste.numero and ajuste.numero != db_ajuste.numero:
        existing = ajuste_estoque_repository.get_by_numero(db, ajuste.numero)
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Já existe um ajuste com o número {ajuste.numero}"
            )
    
    return ajuste_estoque_repository.update_with_itens(db, db_ajuste, ajuste)

@router.delete("/{ajuste_id}", status_code=204)
def delete_ajuste(ajuste_id: int, db: Session = Depends(get_db)):
    """Exclui um ajuste de estoque"""
    ajuste = ajuste_estoque_repository.get(db, ajuste_id)
    
    if not ajuste:
        raise HTTPException(status_code=404, detail="Ajuste não encontrado")
    
    ajuste_estoque_repository.delete(db, id=ajuste_id)
    return None
