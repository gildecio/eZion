from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine, Base
from decimal import Decimal
import json
import re

# Import all models to ensure they are registered with Base
from app.modules.contabil.models import *  # noqa
from app.modules.estoque.models import *  # noqa

# Create database tables
Base.metadata.create_all(bind=engine)


class DecimalCommaMiddleware(BaseHTTPMiddleware):
    """Middleware para converter pontos decimais em vírgulas nas respostas JSON"""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Só processa respostas JSON
        if response.headers.get("content-type", "").startswith("application/json"):
            # Lê o corpo da resposta
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            
            # Converte bytes para string, substitui . por , em números decimais
            content = body.decode()
            # Só processa se houver conteúdo e não for 204 No Content
            if response.status_code == 204 or not content.strip():
                return response
            # Substitui padrões como "123.45" por "123,45" mas preserva URLs, datas, etc.
            # Pattern: número seguido de ponto e mais números entre aspas
            content = re.sub(r'":(\d+)\.(\d+)"', r'":\1,\2"', content)
            content = re.sub(r'":(-?\d+)\.(\d+)"', r'":\1,\2"', content)
            
            return JSONResponse(
                content=json.loads(content),
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        
        return response


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Add decimal comma middleware
app.add_middleware(DecimalCommaMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": f"Bem-vindo ao {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
