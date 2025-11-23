-- Adiciona coluna tipo_documento à tabela documentos
ALTER TABLE documentos 
ADD COLUMN tipo_documento VARCHAR(50) NOT NULL DEFAULT 'Nota Fiscal de Compra';

-- Remove o default após popular os dados existentes
ALTER TABLE documentos 
ALTER COLUMN tipo_documento DROP DEFAULT;

-- Cria índice para melhor performance em consultas por tipo
CREATE INDEX idx_documentos_tipo_documento ON documentos(tipo_documento);

-- Adiciona comentário
COMMENT ON COLUMN documentos.tipo_documento IS 'Tipo do documento: NF_COMPRA, NF_VENDA, TRANSFERENCIA_ENTRADA, etc.';
