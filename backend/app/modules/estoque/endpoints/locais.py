from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.modules.estoque.schemas.local import LocalCreate, LocalUpdate, LocalInDB
from app.modules.estoque.repositories.local_repository import LocalRepository

router = APIRouter()


@router.get("/", response_model=List[LocalInDB])
def listar_locais(
    skip: int = 0,
    limit: int = 100,
    apenas_ativos: bool = False,
    db: Session = Depends(get_db)
):
    """Lista todos os locais"""
    repository = LocalRepository(db)
    if apenas_ativos:
        return repository.get_ativos()
    return repository.get_all(skip=skip, limit=limit)


@router.get("/{local_id}", response_model=LocalInDB)
def obter_local(local_id: int, db: Session = Depends(get_db)):
    """Obtém um local por ID"""
    repository = LocalRepository(db)
    local = repository.get(local_id)
    if not local:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Local com ID {local_id} não encontrado"
        )
    return local


@router.post("/", response_model=LocalInDB, status_code=status.HTTP_201_CREATED)
def criar_local(local: LocalCreate, db: Session = Depends(get_db)):
    """Cria um novo local"""
    repository = LocalRepository(db)
    
    # Verifica se já existe um local com o mesmo código
    local_existente = repository.get_by_codigo(local.codigo)
    if local_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Já existe um local com o código '{local.codigo}'"
        )
    
    return repository.create(local)


@router.put("/{local_id}", response_model=LocalInDB)
def atualizar_local(
    local_id: int,
    local_update: LocalUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um local existente"""
    repository = LocalRepository(db)
    
    local = repository.get(local_id)
    if not local:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Local com ID {local_id} não encontrado"
        )
    
    # Verifica se o código está sendo alterado e se já existe
    if local_update.codigo and local_update.codigo != local.codigo:
        local_existente = repository.get_by_codigo(local_update.codigo)
        if local_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Já existe um local com o código '{local_update.codigo}'"
            )
    
    return repository.update(local_id, local_update)


@router.delete("/{local_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_local(local_id: int, db: Session = Depends(get_db)):
    """Deleta um local"""
    repository = LocalRepository(db)
    
    local = repository.get(local_id)
    if not local:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Local com ID {local_id} não encontrado"
        )
    
    repository.delete(local_id)
    return None
