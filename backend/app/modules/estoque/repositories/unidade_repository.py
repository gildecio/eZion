from app.repositories.base import CRUDBase
from app.modules.estoque.models import Unidade
from app.modules.estoque.schemas import UnidadeCreate, UnidadeUpdate


class UnidadeRepository(CRUDBase[Unidade, UnidadeCreate, UnidadeUpdate]):
    def __init__(self):
        super().__init__(Unidade)


unidade_repository = UnidadeRepository()
