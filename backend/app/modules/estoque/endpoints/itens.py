from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.modules.estoque.schemas import Item, ItemCreate, ItemUpdate
from app.modules.estoque.repositories import item_repository, grupo_item_repository
from app.modules.estoque.models.item import TipoItem

router = APIRouter()


@router.get("/", response_model=List[Item])
def listar_itens(
    skip: int = 0,
    limit: int = 100,
    grupo_id: Optional[int] = Query(None, description="Filtrar por grupo (use 0 para itens sem grupo)"),
    tipo: Optional[TipoItem] = Query(None, description="Filtrar por tipo de item"),
    db: Session = Depends(get_db)
):
    """Lista itens com filtros opcionais"""
    itens = item_repository.get_with_filters(
        db, 
        skip=skip, 
        limit=limit,
        grupo_id=grupo_id,
        tipo=tipo
    )
    return itens


@router.get("/{item_id}", response_model=Item)
def buscar_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Busca um item por ID"""
    item = item_repository.get(db, id=item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item não encontrado"
        )
    return item


@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
def criar_item(
    item_in: ItemCreate,
    db: Session = Depends(get_db)
):
    """Cria um novo item"""
    # Valida se o grupo existe e é folha
    if item_in.grupo_id:
        grupo = grupo_item_repository.get(db, id=item_in.grupo_id)
        if not grupo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grupo não encontrado"
            )
        if not grupo.is_leaf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O item só pode ser vinculado a um grupo folha (sem subgrupos)"
            )
    
    # Gera código automaticamente se não fornecido
    if not item_in.codigo or item_in.codigo.strip() == "":
        # Busca o maior código numérico existente
        from sqlalchemy import text
        
        result = db.execute(text("""
            SELECT MAX(CAST(codigo AS INTEGER)) 
            FROM itens 
            WHERE codigo ~ '^[0-9]+$'
        """)).scalar()
        
        next_codigo = (result or 0) + 1
        item_in.codigo = str(next_codigo).zfill(6)  # Formata com 6 dígitos (000001, 000002, ...)
    
    # Se codigo_alternativo não foi fornecido, copia do codigo
    if not item_in.codigo_alternativo or item_in.codigo_alternativo.strip() == "":
        item_in.codigo_alternativo = item_in.codigo
    
    item = item_repository.create(db, obj_in=item_in)
    return item


@router.put("/{item_id}", response_model=Item)
def atualizar_item(
    item_id: int,
    item_in: ItemUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um item existente"""
    item = item_repository.get(db, id=item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item não encontrado"
        )
    
    # Valida se o grupo existe e é folha (se fornecido)
    if item_in.grupo_id:
        grupo = grupo_item_repository.get(db, id=item_in.grupo_id)
        if not grupo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grupo não encontrado"
            )
        if not grupo.is_leaf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O item só pode ser vinculado a um grupo folha (sem subgrupos)"
            )
    
    item = item_repository.update(db, db_obj=item, obj_in=item_in)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Exclui um item"""
    item = item_repository.get(db, id=item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item não encontrado"
        )
    item_repository.remove(db, id=item_id)
