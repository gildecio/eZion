-- Migration: Create table locais
-- Description: Cria a tabela de locais de armazenamento de itens do estoque

CREATE TABLE IF NOT EXISTS locais (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_locais_codigo ON locais(codigo);
CREATE INDEX idx_locais_ativo ON locais(ativo);

-- Comentários
COMMENT ON TABLE locais IS 'Locais de armazenamento de itens do estoque';
COMMENT ON COLUMN locais.id IS 'Identificador único do local';
COMMENT ON COLUMN locais.codigo IS 'Código único do local';
COMMENT ON COLUMN locais.nome IS 'Nome do local';
COMMENT ON COLUMN locais.descricao IS 'Descrição do local';
COMMENT ON COLUMN locais.ativo IS 'Indica se o local está ativo';
