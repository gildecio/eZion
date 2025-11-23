-- Criação da tabela ajuste_estoque
CREATE TABLE IF NOT EXISTS ajuste_estoque (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    data_entrada DATE,
    data_registro DATE NOT NULL,
    tipo VARCHAR(1) NOT NULL CHECK (tipo IN ('E', 'S')),
    valor NUMERIC(15, 2) NOT NULL DEFAULT 0,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_ajuste_valor CHECK (valor >= 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ajuste_estoque_numero ON ajuste_estoque(numero);
CREATE INDEX IF NOT EXISTS idx_ajuste_estoque_empresa ON ajuste_estoque(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ajuste_estoque_tipo ON ajuste_estoque(tipo);
CREATE INDEX IF NOT EXISTS idx_ajuste_estoque_data_registro ON ajuste_estoque(data_registro);

-- Criação da tabela ajuste_estoque_itens
CREATE TABLE IF NOT EXISTS ajuste_estoque_itens (
    id SERIAL PRIMARY KEY,
    ajuste_id INTEGER NOT NULL REFERENCES ajuste_estoque(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES itens(id) ON DELETE RESTRICT,
    quantidade NUMERIC(15, 3) NOT NULL,
    valor_unitario NUMERIC(15, 2) NOT NULL,
    valor_total NUMERIC(15, 2) NOT NULL,
    lote_id INTEGER REFERENCES lotes(id) ON DELETE SET NULL,
    local_id INTEGER REFERENCES locais(id) ON DELETE SET NULL,
    observacao VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_ajuste_item_quantidade CHECK (quantidade > 0),
    CONSTRAINT chk_ajuste_item_valor_unitario CHECK (valor_unitario >= 0),
    CONSTRAINT chk_ajuste_item_valor_total CHECK (valor_total >= 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ajuste_itens_ajuste ON ajuste_estoque_itens(ajuste_id);
CREATE INDEX IF NOT EXISTS idx_ajuste_itens_item ON ajuste_estoque_itens(item_id);
CREATE INDEX IF NOT EXISTS idx_ajuste_itens_lote ON ajuste_estoque_itens(lote_id);
CREATE INDEX IF NOT EXISTS idx_ajuste_itens_local ON ajuste_estoque_itens(local_id);

-- Comentários
COMMENT ON TABLE ajuste_estoque IS 'Ajustes de estoque (entrada e saída)';
COMMENT ON COLUMN ajuste_estoque.tipo IS 'E = Entrada, S = Saída';
COMMENT ON TABLE ajuste_estoque_itens IS 'Itens dos ajustes de estoque';
