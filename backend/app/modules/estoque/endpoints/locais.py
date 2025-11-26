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
    # Regras especiais para o local padrão (ID=1)
    if local_id == 1:
        # Apenas impedir desativação do local padrão; permitir alteração de código e descrição
        if local_update.ativo is not None and local_update.ativo is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Não é permitido desativar o local padrão "Não Informado"'
            )

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
    from sqlalchemy.exc import IntegrityError, DBAPIError
    
    db_local = local_repository.get(db, id=local_id)
    if not db_local:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Local com ID {local_id} não encontrado"
        )
    
    try:
        local_repository.remove(db, id=local_id)
        return None
    except (IntegrityError, DBAPIError) as e:
        # Captura erros de constraint/trigger do banco
        error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
        
        # Verificar se é o trigger de local padrão
        if "prevent_default_local_delete" in error_msg or "local padrão" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Não é permitido excluir o local padrão "Não Informado"'
            )
        
        # Verificar se há itens vinculados
        if "itens" in error_msg.lower() or "foreign key" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível excluir este local pois existem itens vinculados a ele"
            )
        
        # Erro genérico de integridade
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível excluir este local. Verifique se não há registros vinculados"
        )
