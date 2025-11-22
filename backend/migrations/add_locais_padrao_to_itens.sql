-- Migration: Add local_padrao_entrada_id and local_padrao_saida_id to itens table
-- Date: 2025-11-22
-- Description: Adds local_padrao_entrada_id and local_padrao_saida_id fields to the itens table
--              to store default input and output locations for items

-- Add the local_padrao_entrada_id column with default value 0
ALTER TABLE itens ADD COLUMN local_padrao_entrada_id INTEGER NOT NULL DEFAULT 0;

-- Add the local_padrao_saida_id column with default value 0
ALTER TABLE itens ADD COLUMN local_padrao_saida_id INTEGER NOT NULL DEFAULT 0;

-- Add foreign key constraints (assuming id 0 exists or will be created in locais table)
ALTER TABLE itens ADD CONSTRAINT fk_itens_local_entrada 
    FOREIGN KEY (local_padrao_entrada_id) REFERENCES locais(id);

ALTER TABLE itens ADD CONSTRAINT fk_itens_local_saida 
    FOREIGN KEY (local_padrao_saida_id) REFERENCES locais(id);

-- Add indexes for better query performance
CREATE INDEX idx_itens_local_padrao_entrada ON itens(local_padrao_entrada_id);
CREATE INDEX idx_itens_local_padrao_saida ON itens(local_padrao_saida_id);

-- Optional: Create a default local with id 0 if it doesn't exist
-- This ensures the foreign key constraints work with the default value
INSERT INTO locais (id, codigo, nome, descricao, ativo) 
VALUES (0, 'PADRAO', 'Local Padrão', 'Local padrão do sistema', true)
ON CONFLICT (id) DO NOTHING;
