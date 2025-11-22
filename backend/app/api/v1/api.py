from fastapi import APIRouter
from app.modules.contabil.endpoints import empresas

api_router = APIRouter()

# Contábil routes
api_router.include_router(
    empresas.router,
    prefix="/contabil/empresas",
    tags=["Contábil - Empresas"]
)
