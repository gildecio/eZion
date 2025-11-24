-- Migration: Refatorar MovimentacaoEstoque (SQLite)
-- Remove campo documento, adiciona numero e serie

-- SQLite não suporta DROP COLUMN diretamente, precisamos recriar a tabela
-- Mas como estamos no início, vamos usar um approach mais simples

-- Passo 1: Renomear tabela antiga (backup)
ALTER TABLE movimentacoes_estoque RENAME TO movimentacoes_estoque_old;

-- Passo 2: Criar nova estrutura
CREATE TABLE movimentacoes_estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo VARCHAR(50) NOT NULL,
    item_id INTEGER NOT NULL,
    quantidade NUMERIC(15, 4) NOT NULL,
    unidade_id INTEGER NOT NULL,
    lote_id INTEGER,
    local_origem_id INTEGER,
    local_destino_id INTEGER,
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    numero VARCHAR(50),
    serie VARCHAR(10),
    observacoes TEXT,
    custo_unitario NUMERIC(15, 4),
    usuario VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES itens (id),
    FOREIGN KEY (unidade_id) REFERENCES unidades (id),
    FOREIGN KEY (lote_id) REFERENCES lotes (id),
    FOREIGN KEY (local_origem_id) REFERENCES locais (id),
    FOREIGN KEY (local_destino_id) REFERENCES locais (id)
);

-- Passo 3: Migrar dados existentes (se houver)
INSERT INTO movimentacoes_estoque (
    id, tipo, item_id, quantidade, unidade_id, lote_id,
    local_origem_id, local_destino_id, data_movimentacao,
    observacoes, custo_unitario, usuario, created_at, updated_at
)
SELECT 
    id, tipo, item_id, quantidade, unidade_id, lote_id,
    local_origem_id, local_destino_id, data_movimentacao,
    observacoes, custo_unitario, usuario, created_at, updated_at
FROM movimentacoes_estoque_old
WHERE EXISTS (SELECT 1 FROM movimentacoes_estoque_old LIMIT 1);

-- Passo 4: Remover tabela antiga
DROP TABLE movimentacoes_estoque_old;

-- Passo 5: Criar índices
CREATE INDEX idx_movimentacoes_estoque_tipo ON movimentacoes_estoque(tipo);
CREATE INDEX idx_movimentacoes_estoque_item_id ON movimentacoes_estoque(item_id);
CREATE INDEX idx_movimentacoes_estoque_lote_id ON movimentacoes_estoque(lote_id);
CREATE INDEX idx_movimentacoes_estoque_local_origem_id ON movimentacoes_estoque(local_origem_id);
CREATE INDEX idx_movimentacoes_estoque_local_destino_id ON movimentacoes_estoque(local_destino_id);
CREATE INDEX idx_movimentacoes_estoque_data_movimentacao ON movimentacoes_estoque(data_movimentacao);
CREATE INDEX idx_movimentacoes_estoque_numero ON movimentacoes_estoque(numero);
CREATE INDEX idx_movimentacoes_estoque_serie ON movimentacoes_estoque(serie);
