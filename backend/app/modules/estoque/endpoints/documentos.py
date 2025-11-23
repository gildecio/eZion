from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.modules.estoque.schemas.documento import (
    Documento,
    DocumentoCreate,
    DocumentoUpdate,
)
from app.modules.estoque.repositories import documento_repository

router = APIRouter()


@router.get("/", response_model=List[Documento])
def listar_documentos(
    skip: int = 0,
    limit: int = 100,
    empresa_id: Optional[int] = Query(None, description="Filtrar por empresa"),
    data_inicio: Optional[datetime] = Query(None, description="Data inicial"),
    data_fim: Optional[datetime] = Query(None, description="Data final"),
    db: Session = Depends(get_db)
):
    """Lista documentos com filtros opcionais"""
    if data_inicio and data_fim:
        return documento_repository.get_by_periodo(
            db,
            data_inicio=data_inicio,
            data_fim=data_fim,
            empresa_id=empresa_id,
            skip=skip,
            limit=limit
        )
    elif empresa_id:
        return documento_repository.get_by_empresa(
            db,
            empresa_id=empresa_id,
            skip=skip,
            limit=limit
        )
    else:
        return documento_repository.get_multi(db, skip=skip, limit=limit)


@router.get("/{documento_id}", response_model=Documento)
def buscar_documento(
    documento_id: int,
    db: Session = Depends(get_db)
):
    """Busca um documento por ID"""
    documento = documento_repository.get(db, id=documento_id)
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento não encontrado"
        )
    return documento


@router.post("/", response_model=Documento, status_code=status.HTTP_201_CREATED)
def criar_documento(
    documento_in: DocumentoCreate,
    db: Session = Depends(get_db)
):
    """Cria um novo documento"""
    # Verificar se já existe documento com o mesmo número
    existing = documento_repository.get_by_numero(db, numero=documento_in.numero)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Já existe um documento com o número {documento_in.numero}"
        )
    
    return documento_repository.create(db, obj_in=documento_in)


@router.put("/{documento_id}", response_model=Documento)
def atualizar_documento(
    documento_id: int,
    documento_in: DocumentoUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um documento"""
    documento = documento_repository.get(db, id=documento_id)
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento não encontrado"
        )
    
    # Verificar se o novo número já existe em outro documento
    if documento_in.numero and documento_in.numero != documento.numero:
        existing = documento_repository.get_by_numero(db, numero=documento_in.numero)
        if existing and existing.id != documento_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Já existe outro documento com o número {documento_in.numero}"
            )
    
    return documento_repository.update(db, db_obj=documento, obj_in=documento_in)


@router.delete("/{documento_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_documento(
    documento_id: int,
    db: Session = Depends(get_db)
):
    """Exclui um documento"""
    documento = documento_repository.get(db, id=documento_id)
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento não encontrado"
        )
    
    documento_repository.remove(db, id=documento_id)
    return None
