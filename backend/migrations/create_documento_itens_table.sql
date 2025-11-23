-- Criação da tabela de itens de documentos
CREATE TABLE documento_itens (
    id SERIAL PRIMARY KEY,
    quantidade NUMERIC(15, 4) NOT NULL,
    valor_unitario NUMERIC(15, 2) NOT NULL,
    valor_total NUMERIC(15, 2) NOT NULL,
    documento_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    local_id INTEGER NOT NULL,
    CONSTRAINT fk_documento_itens_documento FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_documento_itens_item FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE RESTRICT,
    CONSTRAINT fk_documento_itens_local FOREIGN KEY (local_id) REFERENCES locais(id) ON DELETE RESTRICT,
    CONSTRAINT chk_quantidade_positiva CHECK (quantidade > 0),
    CONSTRAINT chk_valores_nao_negativos CHECK (valor_unitario >= 0 AND valor_total >= 0)
);

-- Índices para melhor performance
CREATE INDEX idx_documento_itens_documento_id ON documento_itens(documento_id);
CREATE INDEX idx_documento_itens_item_id ON documento_itens(item_id);
CREATE INDEX idx_documento_itens_local_id ON documento_itens(local_id);

-- Comentários
COMMENT ON TABLE documento_itens IS 'Itens dos documentos com seus respectivos valores e quantidades';
COMMENT ON COLUMN documento_itens.quantidade IS 'Quantidade do item no documento';
COMMENT ON COLUMN documento_itens.valor_unitario IS 'Valor unitário do item';
COMMENT ON COLUMN documento_itens.valor_total IS 'Valor total (quantidade x valor unitário)';
COMMENT ON COLUMN documento_itens.documento_id IS 'Documento ao qual o item pertence';
COMMENT ON COLUMN documento_itens.item_id IS 'Item relacionado';
COMMENT ON COLUMN documento_itens.local_id IS 'Local de armazenamento do item';
