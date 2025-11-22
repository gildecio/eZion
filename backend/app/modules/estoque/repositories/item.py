from app.repositories.base import CRUDBase
from app.modules.estoque.models import Item
from app.modules.estoque.schemas import ItemCreate, ItemUpdate


class ItemRepository(CRUDBase[Item, ItemCreate, ItemUpdate]):
    pass


item_repository = ItemRepository(Item)
