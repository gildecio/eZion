-- Adiciona campos específicos por tipo de documento (Single Table Inheritance)

-- Campos para Notas Fiscais
ALTER TABLE documentos ADD COLUMN chave_nfe VARCHAR(44);
ALTER TABLE documentos ADD COLUMN serie VARCHAR(10);
ALTER TABLE documentos ADD COLUMN modelo VARCHAR(10);
ALTER TABLE documentos ADD COLUMN cnpj_emissor VARCHAR(14);
ALTER TABLE documentos ADD COLUMN nome_emissor VARCHAR(255);
ALTER TABLE documentos ADD COLUMN cnpj_destinatario VARCHAR(14);
ALTER TABLE documentos ADD COLUMN nome_destinatario VARCHAR(255);

-- Campos para Transferências
ALTER TABLE documentos ADD COLUMN local_origem_id INTEGER;
ALTER TABLE documentos ADD COLUMN local_destino_id INTEGER;

-- Campos para Ordem de Produção
ALTER TABLE documentos ADD COLUMN lote_producao VARCHAR(50);
ALTER TABLE documentos ADD COLUMN data_inicio_producao TIMESTAMP;
ALTER TABLE documentos ADD COLUMN data_fim_producao TIMESTAMP;

-- Campos para Requisição de Material
ALTER TABLE documentos ADD COLUMN centro_custo VARCHAR(50);
ALTER TABLE documentos ADD COLUMN solicitante VARCHAR(255);
ALTER TABLE documentos ADD COLUMN ordem_producao_referencia VARCHAR(50);

-- Campos para Ajustes
ALTER TABLE documentos ADD COLUMN motivo_ajuste VARCHAR(500);
ALTER TABLE documentos ADD COLUMN responsavel_ajuste VARCHAR(255);

-- Campos para Remessa
ALTER TABLE documentos ADD COLUMN data_retorno_prevista TIMESTAMP;
ALTER TABLE documentos ADD COLUMN destinatario_remessa VARCHAR(255);

-- Campo genérico
ALTER TABLE documentos ADD COLUMN observacoes VARCHAR(1000);

-- Foreign Keys
ALTER TABLE documentos ADD CONSTRAINT fk_documentos_local_origem 
    FOREIGN KEY (local_origem_id) REFERENCES locais(id) ON DELETE SET NULL;

ALTER TABLE documentos ADD CONSTRAINT fk_documentos_local_destino 
    FOREIGN KEY (local_destino_id) REFERENCES locais(id) ON DELETE SET NULL;

-- Índices para campos mais consultados
CREATE INDEX idx_documentos_chave_nfe ON documentos(chave_nfe);
CREATE INDEX idx_documentos_cnpj_emissor ON documentos(cnpj_emissor);
CREATE INDEX idx_documentos_cnpj_destinatario ON documentos(cnpj_destinatario);
CREATE INDEX idx_documentos_local_origem ON documentos(local_origem_id);
CREATE INDEX idx_documentos_local_destino ON documentos(local_destino_id);

-- Comentários
COMMENT ON COLUMN documentos.chave_nfe IS 'Chave de acesso da NFe (44 caracteres)';
COMMENT ON COLUMN documentos.serie IS 'Série da nota fiscal';
COMMENT ON COLUMN documentos.modelo IS 'Modelo da nota fiscal (55, 65, etc)';
COMMENT ON COLUMN documentos.cnpj_emissor IS 'CNPJ do emissor do documento';
COMMENT ON COLUMN documentos.nome_emissor IS 'Nome/Razão social do emissor';
COMMENT ON COLUMN documentos.cnpj_destinatario IS 'CNPJ do destinatário';
COMMENT ON COLUMN documentos.nome_destinatario IS 'Nome/Razão social do destinatário';
COMMENT ON COLUMN documentos.local_origem_id IS 'Local de origem (para transferências)';
COMMENT ON COLUMN documentos.local_destino_id IS 'Local de destino (para transferências)';
COMMENT ON COLUMN documentos.lote_producao IS 'Lote de produção';
COMMENT ON COLUMN documentos.data_inicio_producao IS 'Data de início da produção';
COMMENT ON COLUMN documentos.data_fim_producao IS 'Data de fim da produção';
COMMENT ON COLUMN documentos.centro_custo IS 'Centro de custo (requisições)';
COMMENT ON COLUMN documentos.solicitante IS 'Nome do solicitante';
COMMENT ON COLUMN documentos.ordem_producao_referencia IS 'Referência da ordem de produção';
COMMENT ON COLUMN documentos.motivo_ajuste IS 'Motivo do ajuste de inventário';
COMMENT ON COLUMN documentos.responsavel_ajuste IS 'Responsável pelo ajuste';
COMMENT ON COLUMN documentos.data_retorno_prevista IS 'Data prevista de retorno (remessas)';
COMMENT ON COLUMN documentos.destinatario_remessa IS 'Destinatário da remessa';
COMMENT ON COLUMN documentos.observacoes IS 'Observações gerais do documento';
