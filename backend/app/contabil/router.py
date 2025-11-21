from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.contabil import crud, schemas

router = APIRouter(prefix="/contabil", tags=["contabil"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/empresas", response_model=schemas.EmpresaRead, status_code=201)
def create_empresa(empresa: schemas.EmpresaCreate, db: Session = Depends(get_db)):
    return crud.create_empresa(db=db, empresa=empresa)


@router.get("/empresas", response_model=List[schemas.EmpresaRead])
def read_empresas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_empresas(db=db, skip=skip, limit=limit)
