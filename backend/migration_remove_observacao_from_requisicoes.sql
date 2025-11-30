-- Migração para remover a coluna observacao da tabela requisicoes
-- Execute este script no banco de dados SQLite

ALTER TABLE requisicoes DROP COLUMN observacao;