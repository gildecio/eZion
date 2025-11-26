from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.modules.estoque.models.embalagem import Embalagem
from app.modules.estoque.schemas.embalagem import EmbalagemCreate, EmbalagemUpdate


class EmbalagemRepository(CRUDBase[Embalagem, EmbalagemCreate, EmbalagemUpdate]):
    def __init__(self):
        super().__init__(Embalagem)

    def exists_associations(self, db: Session, embalagem_id: int) -> bool:
        # Lazy check without import cycles: query association table directly by name
        return db.execute(
            "SELECT 1 FROM embalagens_item WHERE descricao IS NOT NULL AND unidade_id IS NOT NULL LIMIT 1"
        ) is not None  # placeholder; detailed FK check added in endpoint


embalagem_repository = EmbalagemRepository()
