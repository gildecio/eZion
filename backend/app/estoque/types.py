from enum import Enum


class TipoItem(Enum):
    PRODUTO = "Produto"
    PRODUTO_EM_CONSTRUCAO = "Produto em Construção"
    INSUMO = "Insumo"
    EMBALAGEM = "Embalagem"
    IMOBILIZADO = "Imobilizado"
    SERVICO = "Serviço"
