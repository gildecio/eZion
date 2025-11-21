from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
from .config import get_database_url, get_server_database_url, settings


# Ensure the database exists on the server; if not, create it.
def ensure_database_exists(db_name: str):
    server_url = get_server_database_url(db_name="postgres")
    # connect to the server-level database (postgres) with autocommit
    tmp_engine = create_engine(server_url, isolation_level="AUTOCOMMIT")
    try:
        with tmp_engine.connect() as conn:
            # check if database exists
            result = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :d"),
                {"d": db_name},
            )
            exists = result.scalar() is not None
            if not exists:
                # create database; quote name to be safe
                conn.execute(text(f'CREATE DATABASE "{db_name}"'))
    finally:
        tmp_engine.dispose()


DATABASE_URL = get_database_url()

# Ensure Postgres database exists only when using a Postgres URL
if "postgresql" in DATABASE_URL:
    try:
        ensure_database_exists(settings.POSTGRES_DB)
    except OperationalError:
        raise

# Engine e session sync (suficiente para a maioria dos casos iniciais)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    # Import all modules that define models so that
    # they will be registered on the metadata.
    from app.contabil import models as contabil_models  # noqa: F401
    from app.vendas import models as vendas_models  # noqa: F401
    from app.estoque import models as estoque_models  # noqa: F401

    Base.metadata.create_all(bind=engine)
