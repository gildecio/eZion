from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.modules.contabil.repositories import empresa as empresa_repo
from app.modules.contabil.schemas import EmpresaCreate, EmpresaUpdate, EmpresaResponse

router = APIRouter()


@router.get("/", response_model=List[EmpresaResponse], summary="Listar empresas")
def list_empresas(
    skip: int = Query(0, ge=0, description="Número de registros para pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    ativo: Optional[bool] = Query(None, description="Filtrar por status ativo"),
    db: Session = Depends(get_db),
):
    """
    Retorna uma lista de empresas com paginação.
    
    - **skip**: número de registros para pular (padrão: 0)
    - **limit**: limite de registros retornados (padrão: 100, máximo: 1000)
    - **ativo**: filtrar apenas empresas ativas (opcional)
    """
    filters = {}
    if ativo is not None:
        filters["ativo"] = ativo
    
    empresas = empresa_repo.get_multi(db, skip=skip, limit=limit, filters=filters)
    return empresas


@router.get("/{empresa_id}", response_model=EmpresaResponse, summary="Buscar empresa por ID")
def get_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
):
    """
    Retorna uma empresa específica pelo ID.
    """
    empresa = empresa_repo.get(db, id=empresa_id)
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Empresa com ID {empresa_id} não encontrada"
        )
    return empresa


@router.post("/", response_model=EmpresaResponse, status_code=status.HTTP_201_CREATED, summary="Criar empresa")
def create_empresa(
    empresa_in: EmpresaCreate,
    db: Session = Depends(get_db),
):
    """
    Cria uma nova empresa.
    
    - **razao_social**: razão social da empresa (obrigatório)
    - **cnpj**: CNPJ com 14 dígitos numéricos (obrigatório)
    - **ativo**: status da empresa (padrão: true)
    """
    # Verificar se CNPJ já existe
    existing = empresa_repo.get_by_cnpj(db, cnpj=empresa_in.cnpj)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CNPJ {empresa_in.cnpj} já cadastrado"
        )
    
    empresa = empresa_repo.create(db, obj_in=empresa_in)
    return empresa


@router.put("/{empresa_id}", response_model=EmpresaResponse, summary="Atualizar empresa")
def update_empresa(
    empresa_id: int,
    empresa_in: EmpresaUpdate,
    db: Session = Depends(get_db),
):
    """
    Atualiza uma empresa existente.
    
    Todos os campos são opcionais. Apenas os campos fornecidos serão atualizados.
    """
    empresa = empresa_repo.get(db, id=empresa_id)
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Empresa com ID {empresa_id} não encontrada"
        )
    
    # Se CNPJ foi fornecido, verificar se não existe em outra empresa
    if empresa_in.cnpj:
        existing = empresa_repo.get_by_cnpj(db, cnpj=empresa_in.cnpj)
        if existing and existing.id != empresa_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"CNPJ {empresa_in.cnpj} já cadastrado em outra empresa"
            )
    
    empresa = empresa_repo.update(db, db_obj=empresa, obj_in=empresa_in)
    return empresa


@router.delete("/{empresa_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Deletar empresa")
def delete_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
):
    """
    Deleta uma empresa pelo ID.
    """
    empresa = empresa_repo.get(db, id=empresa_id)
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Empresa com ID {empresa_id} não encontrada"
        )
    
    empresa_repo.delete(db, id=empresa_id)
    return None
