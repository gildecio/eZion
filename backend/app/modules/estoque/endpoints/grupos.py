from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.estoque.schemas import (
    GrupoItem,
    GrupoItemCreate,
    GrupoItemUpdate,
    GrupoItemTree,
    GrupoItemWithItems
)
from app.modules.estoque.repositories import grupo_item_repository

router = APIRouter(tags=["Grupos de Itens"])


@router.get("/", response_model=List[GrupoItem])
def listar_grupos(db: Session = Depends(get_db)):
    """Lista todos os grupos de itens"""
    grupos = grupo_item_repository.get_multi(db)
    return [
        GrupoItem(
            id=grupo.id,
            nome=grupo.nome,
            parent_id=grupo.parent_id,
            created_at=grupo.created_at,
            updated_at=grupo.updated_at,
            is_leaf=grupo.is_leaf,
            level=grupo.get_level(db)
        )
        for grupo in grupos
    ]


@router.get("/tree", response_model=List[GrupoItemTree])
def listar_arvore(db: Session = Depends(get_db)):
    """Retorna estrutura hierárquica completa"""
    roots = grupo_item_repository.get_roots(db)
    
    def build_tree_response(grupo) -> GrupoItemTree:
        children = grupo_item_repository.get_children(db, grupo.id)
        path_objects = grupo.get_path(db)
        path_names = [g.nome for g in path_objects]
        
        return GrupoItemTree(
            id=grupo.id,
            nome=grupo.nome,
            parent_id=grupo.parent_id,
            created_at=grupo.created_at,
            updated_at=grupo.updated_at,
            is_leaf=len(children) == 0,
            level=grupo.get_level(db),
            path=path_names,
            children=[build_tree_response(child) for child in children]
        )
    
    return [build_tree_response(root) for root in roots]


@router.get("/leaves", response_model=List[GrupoItem])
def listar_folhas(db: Session = Depends(get_db)):
    """Retorna apenas grupos folha (sem filhos)"""
    leaves = grupo_item_repository.get_leaves(db)
    return [
        GrupoItem(
            id=leaf.id,
            nome=leaf.nome,
            parent_id=leaf.parent_id,
            created_at=leaf.created_at,
            updated_at=leaf.updated_at,
            is_leaf=True,
            level=leaf.get_level(db)
        )
        for leaf in leaves
    ]


@router.get("/{grupo_id}", response_model=GrupoItemWithItems)
def obter_grupo(grupo_id: int, db: Session = Depends(get_db)):
    """Obtém um grupo específico"""
    grupo = grupo_item_repository.get(db, grupo_id)
    if not grupo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grupo com ID {grupo_id} não encontrado"
        )
    
    return GrupoItemWithItems(
        id=grupo.id,
        nome=grupo.nome,
        parent_id=grupo.parent_id,
        created_at=grupo.created_at,
        updated_at=grupo.updated_at,
        is_leaf=grupo.is_leaf,
        level=grupo.get_level(db),
        items_count=len(grupo.itens) if grupo.itens else 0
    )


@router.post("/", response_model=GrupoItem, status_code=status.HTTP_201_CREATED)
def criar_grupo(grupo_data: GrupoItemCreate, db: Session = Depends(get_db)):
    """Cria um novo grupo"""
    # Valida se parent_id existe
    if grupo_data.parent_id:
        parent = grupo_item_repository.get(db, grupo_data.parent_id)
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Grupo pai com ID {grupo_data.parent_id} não encontrado"
            )
    
    grupo = grupo_item_repository.create(db, obj_in=grupo_data)
    
    return GrupoItem(
        id=grupo.id,
        nome=grupo.nome,
        parent_id=grupo.parent_id,
        created_at=grupo.created_at,
        updated_at=grupo.updated_at,
        is_leaf=grupo.is_leaf,
        level=grupo.get_level(db)
    )


@router.put("/{grupo_id}", response_model=GrupoItem)
def atualizar_grupo(
    grupo_id: int,
    grupo_data: GrupoItemUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um grupo existente"""
    grupo = grupo_item_repository.get(db, grupo_id)
    if not grupo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grupo com ID {grupo_id} não encontrado"
        )
    
    # Valida parent_id se fornecido
    if grupo_data.parent_id is not None:
        # Verifica se parent existe
        if grupo_data.parent_id > 0:
            parent = grupo_item_repository.get(db, grupo_data.parent_id)
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Grupo pai com ID {grupo_data.parent_id} não encontrado"
                )
        
        # Verifica referência circular
        if grupo_item_repository.has_circular_reference(db, grupo_id, grupo_data.parent_id):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Operação criaria referência circular na hierarquia"
            )
    
    grupo_atualizado = grupo_item_repository.update(db, db_obj=grupo, obj_in=grupo_data)
    
    return GrupoItem(
        id=grupo_atualizado.id,
        nome=grupo_atualizado.nome,
        parent_id=grupo_atualizado.parent_id,
        created_at=grupo_atualizado.created_at,
        updated_at=grupo_atualizado.updated_at,
        is_leaf=grupo_atualizado.is_leaf,
        level=grupo_atualizado.get_level(db)
    )


@router.delete("/{grupo_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_grupo(grupo_id: int, db: Session = Depends(get_db)):
    """Deleta um grupo"""
    grupo = grupo_item_repository.get(db, grupo_id)
    if not grupo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grupo com ID {grupo_id} não encontrado"
        )
    
    # Verifica se tem filhos
    if not grupo.is_leaf:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Não é possível excluir grupo que possui subgrupos"
        )
    
    # Verifica se tem itens vinculados
    if grupo.itens and len(grupo.itens) > 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Não é possível excluir grupo com {len(grupo.itens)} itens vinculados"
        )
    
    grupo_item_repository.remove(db, grupo_id)
