-- Criação da tabela de documentos
CREATE TABLE documentos (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    data_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_entrada TIMESTAMP,
    valor NUMERIC(15, 2) NOT NULL,
    empresa_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documentos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_documentos_empresa_id ON documentos(empresa_id);
CREATE INDEX idx_documentos_numero ON documentos(numero);
CREATE INDEX idx_documentos_data_registro ON documentos(data_registro);
CREATE INDEX idx_documentos_data_entrada ON documentos(data_entrada);

-- Comentários
COMMENT ON TABLE documentos IS 'Documentos relacionados às empresas';
COMMENT ON COLUMN documentos.numero IS 'Número único do documento';
COMMENT ON COLUMN documentos.data_registro IS 'Data de registro do documento no sistema';
COMMENT ON COLUMN documentos.data_entrada IS 'Data de entrada/emissão do documento';
COMMENT ON COLUMN documentos.valor IS 'Valor total do documento';
COMMENT ON COLUMN documentos.empresa_id IS 'Empresa relacionada ao documento';
