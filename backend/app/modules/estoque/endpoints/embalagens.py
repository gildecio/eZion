from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.estoque.schemas import (
    EmbalagemItem,
    EmbalagemItemCreate,
    EmbalagemItemUpdate,
    EmbalagemItemWithUnidade
)
from app.modules.estoque.repositories import embalagem_item_repository, item_repository, unidade_repository

router = APIRouter(tags=["Embalagens de Itens"])


@router.get("/item/{item_id}", response_model=List[EmbalagemItemWithUnidade])
def listar_embalagens_item(item_id: int, db: Session = Depends(get_db)):
    """Lista todas as embalagens de um item"""
    # Verifica se o item existe
    item = item_repository.get(db, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item com ID {item_id} não encontrado"
        )
    
    embalagens = embalagem_item_repository.get_by_item(db, item_id)
    
    # Enriquece com dados da unidade
    result = []
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
                unidade_descricao=unidade.descricao if unidade else ""
            )
        )
    
    return result


@router.get("/{embalagem_id}", response_model=EmbalagemItem)
def obter_embalagem(embalagem_id: int, db: Session = Depends(get_db)):
    """Obtém uma embalagem específica"""
    embalagem = embalagem_item_repository.get(db, embalagem_id)
    if not embalagem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Embalagem com ID {embalagem_id} não encontrada"
        )
    return embalagem


@router.post("/", response_model=EmbalagemItem, status_code=status.HTTP_201_CREATED)
def criar_embalagem(embalagem_data: EmbalagemItemCreate, db: Session = Depends(get_db)):
    """Cria uma nova embalagem para um item"""
    # Verifica se o item existe
    item = item_repository.get(db, embalagem_data.item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item com ID {embalagem_data.item_id} não encontrado"
        )
    
    # Verifica se a unidade existe
    unidade = unidade_repository.get(db, embalagem_data.unidade_id)
    if not unidade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unidade com ID {embalagem_data.unidade_id} não encontrada"
        )
    
    # Valida compatibilidade de tipo de medida
    if item.unidade_padrao_id:
        unidade_padrao = unidade_repository.get(db, item.unidade_padrao_id)
        if unidade_padrao and unidade_padrao.tipo_medida != unidade.tipo_medida:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A unidade da embalagem ({unidade.tipo_medida}) deve ser do mesmo tipo que a unidade padrão do item ({unidade_padrao.tipo_medida}). "
                       f"Exemplo: se o item usa '{unidade_padrao.sigla}' ({unidade_padrao.tipo_medida}), "
                       f"a embalagem deve usar uma unidade de {unidade_padrao.tipo_medida} também."
            )
    
    # Se está marcando como padrão, remove o padrão das outras embalagens
    if embalagem_data.padrao:
        embalagens_existentes = embalagem_item_repository.get_by_item(db, embalagem_data.item_id)
        for emb in embalagens_existentes:
            if emb.padrao:
                embalagem_item_repository.update(db, db_obj=emb, obj_in={"padrao": False})
    
    embalagem = embalagem_item_repository.create(db, obj_in=embalagem_data)
    return embalagem


@router.put("/{embalagem_id}", response_model=EmbalagemItem)
def atualizar_embalagem(
    embalagem_id: int,
    embalagem_data: EmbalagemItemUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza uma embalagem existente"""
    embalagem = embalagem_item_repository.get(db, embalagem_id)
    if not embalagem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Embalagem com ID {embalagem_id} não encontrada"
        )
    
    # Se está alterando a unidade, valida compatibilidade
    if embalagem_data.unidade_id:
        item = item_repository.get(db, embalagem.item_id)
        unidade = unidade_repository.get(db, embalagem_data.unidade_id)
        
        if not unidade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Unidade com ID {embalagem_data.unidade_id} não encontrada"
            )
        
        if item.unidade_padrao_id:
            unidade_padrao = unidade_repository.get(db, item.unidade_padrao_id)
            if unidade_padrao and unidade_padrao.tipo_medida != unidade.tipo_medida:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"A unidade da embalagem ({unidade.tipo_medida}) deve ser do mesmo tipo que a unidade padrão do item ({unidade_padrao.tipo_medida})"
                )
    
    # Se está marcando como padrão, remove o padrão das outras embalagens
    if embalagem_data.padrao:
        embalagens_existentes = embalagem_item_repository.get_by_item(db, embalagem.item_id)
        for emb in embalagens_existentes:
            if emb.id != embalagem_id and emb.padrao:
                embalagem_item_repository.update(db, db_obj=emb, obj_in={"padrao": False})
    
    embalagem = embalagem_item_repository.update(db, db_obj=embalagem, obj_in=embalagem_data)
    return embalagem


@router.delete("/{embalagem_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_embalagem(embalagem_id: int, db: Session = Depends(get_db)):
    """Deleta uma embalagem"""
    embalagem = embalagem_item_repository.get(db, embalagem_id)
    if not embalagem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Embalagem com ID {embalagem_id} não encontrada"
        )
    
    embalagem_item_repository.remove(db, id=embalagem_id)
    return None
