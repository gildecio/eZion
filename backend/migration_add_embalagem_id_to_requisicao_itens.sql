-- Migração para adicionar a coluna embalagem_id à tabela requisicao_itens
-- Execute este script no banco de dados SQLite

ALTER TABLE requisicao_itens ADD COLUMN embalagem_id INTEGER NOT NULL DEFAULT 1;