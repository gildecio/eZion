from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.modules.estoque.models.local import Local
from app.modules.estoque.schemas.local import LocalCreate, LocalUpdate


class LocalRepository(CRUDBase[Local, LocalCreate, LocalUpdate]):
    def __init__(self, db: Session):
        super().__init__(Local)
        self.db = db

    def get_by_codigo(self, codigo: str) -> Optional[Local]:
        """Busca um local pelo código"""
        return self.db.query(Local).filter(Local.codigo == codigo).first()

    def get_ativos(self) -> List[Local]:
        """Retorna apenas os locais ativos"""
        return self.db.query(Local).filter(Local.ativo == True).all()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Local]:
        """Retorna todos os locais"""
        return self.get_multi(self.db, skip=skip, limit=limit)

    def get(self, id: int) -> Optional[Local]:
        """Busca um local por ID"""
        return super().get(self.db, id)

    def create(self, obj_in: LocalCreate) -> Local:
        """Cria um novo local"""
        return super().create(self.db, obj_in=obj_in)

    def update(self, id: int, obj_in: LocalUpdate) -> Local:
        """Atualiza um local"""
        db_obj = self.get(id)
        if not db_obj:
            raise ValueError(f"Local com ID {id} não encontrado")
        return super().update(self.db, db_obj=db_obj, obj_in=obj_in)

    def delete(self, id: int) -> None:
        """Deleta um local"""
        super().remove(self.db, id=id)
