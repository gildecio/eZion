from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.contabil import router as contabil_router
from app.vendas import router as vendas_router
from app.core.database import init_db


def create_app() -> FastAPI:
    app = FastAPI(title="eZion ERP - Backend", version="0.1.0")

    # CORS básico para desenvolvimento
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(contabil_router)
    app.include_router(vendas_router)

    @app.on_event("startup")
    def on_startup():
        init_db()

    return app


app = create_app()
