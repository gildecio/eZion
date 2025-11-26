-- Remove todas movimentações, saldos e ajustes de estoque
-- e reseta os IDs das tabelas para 1 (PostgreSQL)

-- Apaga ajustes de estoque e seus itens (CASCADE remove os itens automaticamente)
TRUNCATE TABLE ajuste_estoque RESTART IDENTITY CASCADE;

-- Apaga movimentações de estoque
TRUNCATE TABLE movimentacoes_estoque RESTART IDENTITY CASCADE;

-- Apaga saldos de estoque
TRUNCATE TABLE saldos_estoque RESTART IDENTITY CASCADE;

-- Opcional: Apaga lotes, locais, itens, embalagens, etc.
-- TRUNCATE TABLE lotes RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE locais RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE itens RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE embalagens_item RESTART IDENTITY CASCADE;

-- Observação: RESTART IDENTITY reseta o contador de IDs para 1.
-- CASCADE garante que dependências sejam removidas automaticamente.

-- Execute este script com cuidado em ambiente de produção!
