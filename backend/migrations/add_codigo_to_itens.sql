-- Migration: Add codigo column to itens table
-- Date: 2025-11-22
-- Description: Adds a codigo (code) field to the itens table to store unique item codes

-- Add the codigo column (nullable initially to allow for data migration)
ALTER TABLE itens ADD COLUMN codigo VARCHAR(50);

-- Update existing rows with a default codigo based on their id
UPDATE itens SET codigo = CONCAT('ITEM-', LPAD(CAST(id AS VARCHAR), 6, '0'));

-- Now make the column NOT NULL and add unique constraint
ALTER TABLE itens ALTER COLUMN codigo SET NOT NULL;
ALTER TABLE itens ADD CONSTRAINT itens_codigo_unique UNIQUE (codigo);

-- Add index for better query performance
CREATE INDEX idx_itens_codigo ON itens(codigo);
