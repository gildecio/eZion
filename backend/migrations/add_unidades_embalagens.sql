-- Criar tabela de unidades
CREATE TABLE IF NOT EXISTS unidades (
    id SERIAL PRIMARY KEY,
    sigla VARCHAR(10) NOT NULL UNIQUE,
    descricao VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_unidades_sigla ON unidades(sigla);

-- Adicionar coluna unidade_padrao_id na tabela itens
ALTER TABLE itens ADD COLUMN IF NOT EXISTS unidade_padrao_id INTEGER;
ALTER TABLE itens ADD CONSTRAINT fk_itens_unidade_padrao 
    FOREIGN KEY (unidade_padrao_id) REFERENCES unidades(id);

CREATE INDEX IF NOT EXISTS idx_itens_unidade_padrao ON itens(unidade_padrao_id);

-- Criar tabela de embalagens_item
CREATE TABLE IF NOT EXISTS embalagens_item (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    unidade_id INTEGER NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    fator_conversao NUMERIC(15, 6) NOT NULL,
    codigo_barras VARCHAR(50),
    padrao BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_embalagens_item_item FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE CASCADE,
    CONSTRAINT fk_embalagens_item_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id)
);

CREATE INDEX IF NOT EXISTS idx_embalagens_item_item_id ON embalagens_item(item_id);
CREATE INDEX IF NOT EXISTS idx_embalagens_item_unidade_id ON embalagens_item(unidade_id);
