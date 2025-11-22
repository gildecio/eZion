from fastapi import APIRouter
from app.modules.contabil.endpoints import empresas
from app.modules.estoque.endpoints import itens, grupos, unidades, embalagens, locais

api_router = APIRouter()

# Contábil routes
api_router.include_router(
    empresas.router,
    prefix="/contabil/empresas",
    tags=["Contábil - Empresas"]
)

# Estoque routes
api_router.include_router(
    itens.router,
    prefix="/estoque/itens",
    tags=["Estoque - Itens"]
)

api_router.include_router(
    grupos.router,
    prefix="/estoque/grupos",
    tags=["Estoque - Grupos"]
)

api_router.include_router(
    unidades.router,
    prefix="/estoque/unidades",
    tags=["Estoque - Unidades"]
)

api_router.include_router(
    embalagens.router,
    prefix="/estoque/embalagens",
    tags=["Estoque - Embalagens"]
)

api_router.include_router(
    locais.router,
    prefix="/estoque/locais",
    tags=["Estoque - Locais"]
)
