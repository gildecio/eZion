from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.modules.estoque.schemas.local import Local, LocalCreate, LocalUpdate
from app.modules.estoque.repositories.local_repository import local_repository

router = APIRouter()


@router.get("/", response_model=List[Local])
def listar_locais(
    skip: int = 0,
    limit: int = 100,
    apenas_ativos: bool = False,
    db: Session = Depends(get_db)
):
    """Lista todos os locais"""
    if apenas_ativos:
        return local_repository.get_ativos(db, skip=skip, limit=limit)
    return local_repository.get_multi(db, skip=skip, limit=limit)


@router.get("/{local_id}", response_model=Local)
def obter_local(local_id: int, db: Session = Depends(get_db)):
    """Obtém um local por ID"""
    local = local_repository.get(db, id=local_id)
    if not local:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Local com ID {local_id} não encontrado"
        )
    return local


@router.post("/", response_model=Local, status_code=status.HTTP_201_CREATED)
def criar_local(local: LocalCreate, db: Session = Depends(get_db)):
    """Cria um novo local"""
    # Verifica se já existe um local com o mesmo código
    local_existente = local_repository.get_by_codigo(db, codigo=local.codigo)
    if local_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Já existe um local com o código '{local.codigo}'"
        )
    
    return local_repository.create(db, obj_in=local)


@router.put("/{local_id}", response_model=Local)
def atualizar_local(
    local_id: int,
    local_update: LocalUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um local"""
    db_local = local_repository.get(db, id=local_id)
    if not db_local:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Local com ID {local_id} não encontrado"
        )
    
    # Se está mudando o código, verifica duplicação
    if local_update.codigo and local_update.codigo != db_local.codigo:
        local_existente = local_repository.get_by_codigo(db, codigo=local_update.codigo)
        if local_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Já existe um local com o código '{local_update.codigo}'"
            )
    
    return local_repository.update(db, db_obj=db_local, obj_in=local_update)


@router.delete("/{local_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_local(local_id: int, db: Session = Depends(get_db)):
    """Exclui um local"""
    db_local = local_repository.get(db, id=local_id)
    if not db_local:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Local com ID {local_id} não encontrado"
        )
    
    local_repository.remove(db, id=local_id)
    return None
