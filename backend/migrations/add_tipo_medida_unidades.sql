-- Adicionar coluna tipo_medida na tabela unidades
ALTER TABLE unidades 
ADD COLUMN tipo_medida VARCHAR(20) NOT NULL DEFAULT 'Quantidade';

-- Atualizar unidades existentes com tipo apropriado
UPDATE unidades SET tipo_medida = 'Quantidade' WHERE sigla IN ('UN', 'PC', 'DZ', 'CX');
UPDATE unidades SET tipo_medida = 'Peso' WHERE sigla IN ('KG', 'G', 'MG', 'T');
UPDATE unidades SET tipo_medida = 'Volume' WHERE sigla IN ('L', 'ML');

-- Comentário na coluna
COMMENT ON COLUMN unidades.tipo_medida IS 'Tipo de medida: Quantidade, Peso, Volume, Comprimento, Area, Outros';
