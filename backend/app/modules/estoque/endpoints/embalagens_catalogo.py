from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.estoque.schemas.embalagem import (
    Embalagem as EmbalagemSchema,
    EmbalagemCreate,
    EmbalagemUpdate,
)
from app.modules.estoque.repositories.embalagem_repository import embalagem_repository
from app.modules.estoque.repositories import unidade_repository

router = APIRouter(tags=["Catálogo de Embalagens"])


@router.get("/", response_model=List[EmbalagemSchema])
def listar_embalagens(db: Session = Depends(get_db)):
    return embalagem_repository.get_multi(db)


@router.get("/{embalagem_id}", response_model=EmbalagemSchema)
def obter_embalagem(embalagem_id: int, db: Session = Depends(get_db)):
    emb = embalagem_repository.get(db, embalagem_id)
    if not emb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Embalagem {embalagem_id} não encontrada")
    return emb


@router.post("/", response_model=EmbalagemSchema, status_code=status.HTTP_201_CREATED)
def criar_embalagem(data: EmbalagemCreate, db: Session = Depends(get_db)):
    unidade = unidade_repository.get(db, data.unidade_id)
    if not unidade:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Unidade {data.unidade_id} não encontrada")
    return embalagem_repository.create(db, obj_in=data)


@router.put("/{embalagem_id}", response_model=EmbalagemSchema)
def atualizar_embalagem(embalagem_id: int, data: EmbalagemUpdate, db: Session = Depends(get_db)):
    emb = embalagem_repository.get(db, embalagem_id)
    if not emb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Embalagem {embalagem_id} não encontrada")
    if data.unidade_id is not None:
        unidade = unidade_repository.get(db, data.unidade_id)
        if not unidade:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Unidade {data.unidade_id} não encontrada")
    return embalagem_repository.update(db, db_obj=emb, obj_in=data)


@router.delete("/{embalagem_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_embalagem(embalagem_id: int, db: Session = Depends(get_db)):
    emb = embalagem_repository.get(db, embalagem_id)
    if not emb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Embalagem {embalagem_id} não encontrada")

    # Impedir exclusão se houver associações em uso; verifica em embalagens_item por descricao e unidade iguais
    # Como a relação antiga não tem FK, usamos uma verificação por conteúdo para evitar apagar um catálogo
    from app.modules.estoque.models import EmbalagemItem  # import local para evitar ciclos
    assoc_exists = db.query(EmbalagemItem).filter(
        EmbalagemItem.unidade_id == emb.unidade_id,
        EmbalagemItem.descricao == emb.descricao,
    ).first()
    if assoc_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível excluir: existem itens associados a uma embalagem com mesma descrição/unidade. Remova as associações primeiro."
        )

    embalagem_repository.remove(db, id=embalagem_id)
    return None
