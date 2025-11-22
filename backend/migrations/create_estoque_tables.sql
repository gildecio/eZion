-- Migration: Create tables for stock management system
-- Date: 2025-11-22
-- Description: Creates tables for lotes, movimentacoes_estoque, and saldos_estoque

-- Tabela de Lotes
CREATE TABLE IF NOT EXISTS lotes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    data_fabricacao DATE,
    data_validade DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_lotes_codigo ON lotes(codigo);
CREATE INDEX idx_lotes_data_validade ON lotes(data_validade);

-- Tabela de Movimentações de Estoque
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(18) NOT NULL CHECK (tipo IN ('Entrada', 'Saida', 'Transferencia', 'Ajuste Positivo', 'Ajuste Negativo', 'Inventario', 'Producao', 'Devolucao')),
    item_id INTEGER NOT NULL REFERENCES itens(id),
    quantidade NUMERIC(15, 4) NOT NULL,
    unidade_id INTEGER NOT NULL REFERENCES unidades(id),
    lote_id INTEGER REFERENCES lotes(id),
    local_origem_id INTEGER REFERENCES locais(id),
    local_destino_id INTEGER REFERENCES locais(id),
    data_movimentacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    documento VARCHAR(50),
    observacoes TEXT,
    custo_unitario NUMERIC(15, 4),
    usuario VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_movimentacoes_tipo ON movimentacoes_estoque(tipo);
CREATE INDEX idx_movimentacoes_item_id ON movimentacoes_estoque(item_id);
CREATE INDEX idx_movimentacoes_lote_id ON movimentacoes_estoque(lote_id);
CREATE INDEX idx_movimentacoes_local_origem ON movimentacoes_estoque(local_origem_id);
CREATE INDEX idx_movimentacoes_local_destino ON movimentacoes_estoque(local_destino_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_estoque(data_movimentacao);
CREATE INDEX idx_movimentacoes_documento ON movimentacoes_estoque(documento);

-- Tabela de Saldos de Estoque
CREATE TABLE IF NOT EXISTS saldos_estoque (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES itens(id),
    local_id INTEGER NOT NULL REFERENCES locais(id),
    lote_id INTEGER REFERENCES lotes(id),
    quantidade NUMERIC(15, 4) NOT NULL DEFAULT 0,
    custo_medio NUMERIC(15, 4) DEFAULT 0,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_saldo_item_local_lote UNIQUE (item_id, local_id, lote_id)
);

CREATE INDEX idx_saldos_item_id ON saldos_estoque(item_id);
CREATE INDEX idx_saldos_local_id ON saldos_estoque(local_id);
CREATE INDEX idx_saldos_lote_id ON saldos_estoque(lote_id);
CREATE INDEX idx_saldos_quantidade ON saldos_estoque(quantidade);

-- Comentários nas tabelas
COMMENT ON TABLE lotes IS 'Controle de lotes de produtos com datas de fabricação e validade';
COMMENT ON TABLE movimentacoes_estoque IS 'Registro de todas as movimentações de estoque (entradas, saídas, transferências, ajustes)';
COMMENT ON TABLE saldos_estoque IS 'Saldo atual de estoque por item, local e lote';

-- Comentários em colunas importantes
COMMENT ON COLUMN movimentacoes_estoque.tipo IS 'Tipo de movimentação: Entrada, Saida, Transferencia, Ajuste Positivo, Ajuste Negativo, Inventario, Producao, Devolucao';
COMMENT ON COLUMN movimentacoes_estoque.custo_unitario IS 'Custo unitário para cálculo do custo médio (usado principalmente em entradas)';
COMMENT ON COLUMN saldos_estoque.custo_medio IS 'Custo médio ponderado do item neste local/lote';
COMMENT ON COLUMN saldos_estoque.ultima_atualizacao IS 'Data/hora da última atualização do saldo';
