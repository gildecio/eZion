from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.modules.configuracoes.repositories.sequencia import sequencia_repository
from app.modules.configuracoes.schemas.sequencia import (
    SequenciaCreate,
    SequenciaUpdate,
    SequenciaInDB
)

router = APIRouter()


@router.get("/", response_model=List[SequenciaInDB])
def list_sequencias(
    empresa_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista sequências"""
    if empresa_id:
        return sequencia_repository.get_by_empresa(db, empresa_id, skip, limit)
    
    return sequencia_repository.get_multi(db, skip=skip, limit=limit)


@router.get("/{sequencia_id}", response_model=SequenciaInDB)
def get_sequencia(sequencia_id: int, db: Session = Depends(get_db)):
    """Busca uma sequência específica"""
    sequencia = sequencia_repository.get(db, sequencia_id)
    
    if not sequencia:
        raise HTTPException(status_code=404, detail="Sequência não encontrada")
    
    return sequencia


@router.post("/", response_model=SequenciaInDB, status_code=201)
def create_sequencia(sequencia: SequenciaCreate, db: Session = Depends(get_db)):
    """Cria uma nova sequência"""
    # Verifica se já existe sequência para o mesmo documento_tipo e série
    existing = sequencia_repository.get_by_documento_tipo(
        db, 
        sequencia.empresa_id, 
        sequencia.documento_tipo,
        sequencia.serie
    )
    
    if existing:
        serie_info = f" e série '{sequencia.serie}'" if sequencia.serie else ""
        raise HTTPException(
            status_code=400,
            detail=f"Já existe uma sequência para o tipo '{sequencia.documento_tipo}'{serie_info} na empresa selecionada."
        )
    
    return sequencia_repository.create(db, obj_in=sequencia)


@router.put("/{sequencia_id}", response_model=SequenciaInDB)
def update_sequencia(
    sequencia_id: int,
    sequencia: SequenciaUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza uma sequência"""
    db_sequencia = sequencia_repository.get(db, sequencia_id)
    
    if not db_sequencia:
        raise HTTPException(status_code=404, detail="Sequência não encontrada")
    
    # Se alterando documento_tipo ou série, verifica duplicidade
    if sequencia.documento_tipo or sequencia.serie is not None:
        documento_tipo = sequencia.documento_tipo or db_sequencia.documento_tipo
        serie = sequencia.serie if sequencia.serie is not None else db_sequencia.serie
        
        existing = sequencia_repository.get_by_documento_tipo(
            db,
            db_sequencia.empresa_id,
            documento_tipo,
            serie
        )
        
        if existing and existing.id != sequencia_id:
            serie_info = f" e série '{serie}'" if serie else ""
            raise HTTPException(
                status_code=400,
                detail=f"Já existe uma sequência para o tipo '{documento_tipo}'{serie_info}"
            )
    
    return sequencia_repository.update(db, db_obj=db_sequencia, obj_in=sequencia)


@router.delete("/{sequencia_id}", status_code=204)
def delete_sequencia(sequencia_id: int, db: Session = Depends(get_db)):
    """Exclui uma sequência"""
    sequencia = sequencia_repository.get(db, sequencia_id)
    
    if not sequencia:
        raise HTTPException(status_code=404, detail="Sequência não encontrada")
    
    sequencia_repository.remove(db, id=sequencia_id)
    return None
