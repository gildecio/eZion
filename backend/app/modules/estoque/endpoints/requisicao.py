from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.modules.estoque.schemas.requisicao import Requisicao, RequisicaoCreate, RequisicaoUpdate, StatusRequisicaoEnum
from app.modules.estoque.repositories.requisicao import requisicao_repository

router = APIRouter()

@router.post("/", response_model=Requisicao, status_code=201)
def criar_requisicao(requisicao: RequisicaoCreate, db: Session = Depends(get_db)):
    # TODO: Implementar geração automática de número e série
    # Por enquanto, gerar um número simples para teste
    import random
    numero = f"{random.randint(1, 999999):06d}"
    serie = "2025"
    
    return requisicao_repository.create_with_items(db, requisicao, numero=numero, serie=serie)

@router.get("/", response_model=List[Requisicao])
def listar_requisicoes(
    numero: int = Query(None),
    serie: str = Query(None),
    local_id: int = Query(None),
    data_inicio: str = Query(None),
    data_fim: str = Query(None),
    status: StatusRequisicaoEnum = Query(None),
    db: Session = Depends(get_db)
):
    filtros = {
        'numero': numero,
        'serie': serie,
        'local_id': local_id,
        'data_inicio': data_inicio,
        'data_fim': data_fim,
        'status': status,
    }
    return requisicao_repository.get_by_filters(db, filtros)

@router.get("/{requisicao_id}", response_model=Requisicao)
def obter_requisicao(requisicao_id: int, db: Session = Depends(get_db)):
    req = requisicao_repository.get(db, requisicao_id)
    if not req:
        raise HTTPException(status_code=404, detail="Requisição não encontrada")
    return req

@router.put("/{requisicao_id}", response_model=Requisicao)
def atualizar_requisicao(requisicao_id: int, requisicao: RequisicaoUpdate, db: Session = Depends(get_db)):
    return requisicao_repository.update(db, requisicao_id, requisicao)

@router.delete("/{requisicao_id}", status_code=204)
def excluir_requisicao(requisicao_id: int, db: Session = Depends(get_db)):
    return requisicao_repository.remove(db, requisicao_id)
