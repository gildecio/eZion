-- Migration: Adicionar local_id à tabela requisicoes
-- Adiciona coluna local_id para permitir filtrar requisições por local

-- Adicionar coluna local_id
ALTER TABLE requisicoes ADD COLUMN IF NOT EXISTS local_id INTEGER REFERENCES locais(id);

-- Criar índice na coluna local_id
CREATE INDEX IF NOT EXISTS idx_requisicoes_local_id ON requisicoes(local_id);

-- Comentário para documentação
COMMENT ON COLUMN requisicoes.local_id IS 'ID do local onde a requisição foi feita';