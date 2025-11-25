from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.modules.estoque.repositories.ajuste_estoque import ajuste_estoque_repository
from app.modules.estoque.schemas.ajuste_estoque import (
    AjusteEstoqueCreate,
    AjusteEstoqueUpdate,
    AjusteEstoqueInDB
)
from app.modules.configuracoes.services import sequencia_service
import json
from decimal import Decimal

router = APIRouter()

def ajuste_to_dict(ajuste):
    """Converte um ajuste para dicionário garantindo que serie seja incluído"""
    return {
        "id": ajuste.id,
        "numero": ajuste.numero,
        "serie": ajuste.serie if ajuste.serie else None,
        "data_entrada": str(ajuste.data_entrada),
        "data_registro": str(ajuste.data_registro),
        "tipo": ajuste.tipo,
        "valor": str(ajuste.valor),
        "empresa_id": ajuste.empresa_id,
        "itens": [
            {
                "id": item.id,
                "ajuste_id": item.ajuste_id,
                "item_id": item.item_id,
                "embalagem_id": item.embalagem_id,
                "quantidade": str(item.quantidade),
                "valor_unitario": str(item.valor_unitario),
                "valor_total": str(item.valor_total),
                "lote_id": item.lote_id,
                "local_id": item.local_id,
                "observacao": item.observacao
            }
            for item in ajuste.itens
        ]
    }

@router.get("/")
def list_ajustes(
    empresa_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista ajustes de estoque"""
    if empresa_id:
        ajustes = ajuste_estoque_repository.get_by_empresa(db, empresa_id, skip, limit)
    else:
        ajustes = ajuste_estoque_repository.get_multi(db, skip=skip, limit=limit)
    
    return JSONResponse(content=[ajuste_to_dict(ajuste) for ajuste in ajustes])

@router.get("/{ajuste_id}")
def get_ajuste(ajuste_id: int, db: Session = Depends(get_db)):
    """Busca um ajuste específico"""
    ajuste = ajuste_estoque_repository.get(db, ajuste_id)
    
    if not ajuste:
        raise HTTPException(status_code=404, detail="Ajuste não encontrado")
    
    return JSONResponse(content=ajuste_to_dict(ajuste))

@router.post("/", response_model=AjusteEstoqueInDB, status_code=201)
def create_ajuste(ajuste: AjusteEstoqueCreate, db: Session = Depends(get_db)):
    """Cria um novo ajuste de estoque com itens"""
    # Número será gerado automaticamente no repository dentro da transação
    return ajuste_estoque_repository.create_with_itens(db, ajuste)

@router.put("/{ajuste_id}", response_model=AjusteEstoqueInDB)
def update_ajuste(
    ajuste_id: int,
    ajuste: AjusteEstoqueUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um ajuste de estoque"""
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Recebendo update para ajuste_id={ajuste_id}")
    logger.info(f"Dados recebidos: {ajuste.model_dump()}")
    
    db_ajuste = ajuste_estoque_repository.get(db, ajuste_id)
    
    if not db_ajuste:
        raise HTTPException(status_code=404, detail="Ajuste não encontrado")
    
    # Verifica se novo número já existe
    if ajuste.numero and ajuste.numero != db_ajuste.numero:
        existing = ajuste_estoque_repository.get_by_numero(db, ajuste.numero)
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Já existe um ajuste com o número {ajuste.numero}"
            )
    
    try:
        return ajuste_estoque_repository.update_with_itens(db, db_ajuste, ajuste)
    except Exception as e:
        logger.error(f"Erro no update_ajuste endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{ajuste_id}", status_code=204)
def delete_ajuste(ajuste_id: int, db: Session = Depends(get_db)):
    """Exclui um ajuste de estoque"""
    ajuste = ajuste_estoque_repository.get(db, ajuste_id)
    
    if not ajuste:
        raise HTTPException(status_code=404, detail="Ajuste não encontrado")
    
    ajuste_estoque_repository.remove(db, id=ajuste_id)
    return None
