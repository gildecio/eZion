from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.estoque.repositories import (
    item_repository,
    unidade_repository,
    embalagem_item_repository,
)
from app.modules.estoque.repositories.embalagem_repository import embalagem_repository
from app.modules.estoque.schemas.embalagem_item import (
    EmbalagemItemWithUnidade,
    EmbalagemItem,
    EmbalagemItemFromCatalogCreate,
    EmbalagemItemAssociationUpdate,
)


router = APIRouter(tags=["Itens - Embalagens associadas"])


@router.get("/itens/{item_id}/embalagens", response_model=List[EmbalagemItemWithUnidade])
def listar(item_id: int, db: Session = Depends(get_db)):
    item = item_repository.get(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {item_id} não encontrado")

    embalagens = embalagem_item_repository.get_by_item(db, item_id)
    result: list[EmbalagemItemWithUnidade] = []
    for emb in embalagens:
        unidade = unidade_repository.get(db, emb.unidade_id)
        result.append(
            EmbalagemItemWithUnidade(
                id=emb.id,
                item_id=emb.item_id,
                unidade_id=emb.unidade_id,
                descricao=emb.descricao,
                fator_conversao=emb.fator_conversao,
                codigo_barras=emb.codigo_barras,
                padrao=emb.padrao,
                created_at=emb.created_at,
                updated_at=emb.updated_at,
                unidade_sigla=unidade.sigla if unidade else "",
                unidade_descricao=unidade.descricao if unidade else "",
            )
        )
    return result


@router.post(
    "/itens/{item_id}/embalagens/from-catalogo",
    response_model=EmbalagemItem,
    status_code=status.HTTP_201_CREATED,
)
def criar_from_catalogo(item_id: int, data: EmbalagemItemFromCatalogCreate, db: Session = Depends(get_db)):
    item = item_repository.get(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {item_id} não encontrado")

    catalogo = embalagem_repository.get(db, data.catalogo_embalagem_id)
    if not catalogo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Embalagem de catálogo {data.catalogo_embalagem_id} não encontrada")

    # validar unidade: igual à unidade padrão do item (quando definida)
    if item.unidade_padrao_id:
        if catalogo.unidade_id != item.unidade_padrao_id:
            unidade_item = unidade_repository.get(db, item.unidade_padrao_id)
            unidade_catalogo = unidade_repository.get(db, catalogo.unidade_id)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unidade incompatível: item usa '{unidade_item.sigla if unidade_item else item.unidade_padrao_id}' "
                    f"e a embalagem usa '{unidade_catalogo.sigla if unidade_catalogo else catalogo.unidade_id}'. "
                    f"A unidade da embalagem deve ser a mesma do item."
                ),
            )

    # evitar duplicidade por descricao + unidade
    existentes = embalagem_item_repository.get_by_item(db, item_id)
    for emb in existentes:
        if emb.descricao == catalogo.descricao and emb.unidade_id == catalogo.unidade_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma associação para esta embalagem (mesma descrição e unidade).",
            )

    # se marcar como padrão, desmarcar demais
    if data.padrao:
        for emb in existentes:
            if emb.padrao:
                embalagem_item_repository.update(db, db_obj=emb, obj_in={"padrao": False})

    # Criar objeto usando o schema correto
    from app.modules.estoque.schemas.embalagem_item import EmbalagemItemCreate
    embalagem_data = EmbalagemItemCreate(
        item_id=item_id,
        unidade_id=catalogo.unidade_id,
        descricao=catalogo.descricao,
        fator_conversao=catalogo.fator_conversao,  # Usa o fator do catálogo
        codigo_barras=data.codigo_barras,
        padrao=data.padrao,
    )
    
    created = embalagem_item_repository.create(db, obj_in=embalagem_data)
    return created


@router.put("/itens/{item_id}/embalagens/{embalagem_item_id}/set-default", response_model=EmbalagemItem)
def set_default(item_id: int, embalagem_item_id: int, db: Session = Depends(get_db)):
    emb = embalagem_item_repository.get(db, embalagem_item_id)
    if not emb or emb.item_id != item_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associação não encontrada para este item")

    existentes = embalagem_item_repository.get_by_item(db, item_id)
    for e in existentes:
        if e.id != embalagem_item_id and e.padrao:
            embalagem_item_repository.update(db, db_obj=e, obj_in={"padrao": False})

    emb = embalagem_item_repository.update(db, db_obj=emb, obj_in={"padrao": True})
    return emb


@router.delete("/itens/{item_id}/embalagens/{embalagem_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_associacao(item_id: int, embalagem_item_id: int, db: Session = Depends(get_db)):
    emb = embalagem_item_repository.get(db, embalagem_item_id)
    if not emb or emb.item_id != item_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associação não encontrada para este item")

    embalagem_item_repository.remove(db, id=embalagem_item_id)
    return None


@router.put("/itens/{item_id}/embalagens/{embalagem_item_id}", response_model=EmbalagemItem)
def atualizar_associacao(
    item_id: int,
    embalagem_item_id: int,
    data: EmbalagemItemAssociationUpdate,
    db: Session = Depends(get_db),
):
    emb = embalagem_item_repository.get(db, embalagem_item_id)
    if not emb or emb.item_id != item_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associação não encontrada para este item")

    # se marcar como padrão, desmarcar demais
    if data.padrao:
        existentes = embalagem_item_repository.get_by_item(db, item_id)
        for e in existentes:
            if e.id != embalagem_item_id and e.padrao:
                embalagem_item_repository.update(db, db_obj=e, obj_in={"padrao": False})

    emb = embalagem_item_repository.update(db, db_obj=emb, obj_in=data.model_dump(exclude_unset=True))
    return emb
