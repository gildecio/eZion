from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.modules.contabil.models.empresa import Empresa
from . import LoginRequest, LoginResponse
import secrets

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Endpoint de autenticação
    Usuário hardcoded: admin/admin
    """
    # Validação hardcoded do usuário admin
    if credentials.username != "admin" or credentials.password != "admin":
        raise HTTPException(
            status_code=401,
            detail="Credenciais inválidas"
        )
    
    # Buscar empresa selecionada
    empresa = db.query(Empresa).filter(Empresa.id == credentials.empresa_id).first()
    if not empresa:
        raise HTTPException(
            status_code=404,
            detail="Empresa não encontrada"
        )
    
    # Gerar token simples (em produção, usar JWT)
    token = secrets.token_urlsafe(32)
    
    return LoginResponse(
        token=token,
        user={
            "id": 1,
            "username": "admin",
            "name": "Administrador"
        },
        empresa={
            "id": empresa.id,
            "cnpj": empresa.cnpj,
            "razao_social": empresa.razao_social
        }
    )
