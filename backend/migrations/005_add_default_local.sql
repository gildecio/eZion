-- Migration: Adicionar Local Padrão "Não Informado"
-- Data: 2025-11-23
-- Descrição: Cria local padrão com ID=1 para evitar quebra de relacionamentos

-- Inserir local padrão se não existir
INSERT INTO locais (id, codigo, nome, descricao, ativo)
VALUES (1, 'NAO_INFORMADO', 'Não Informado', 'Local padrão do sistema', true)
ON CONFLICT (id) DO NOTHING;

-- Garantir que a sequência não conflite com o ID 1
SELECT setval('locais_id_seq', GREATEST(1, (SELECT MAX(id) FROM locais)), true);

-- Criar função para impedir deleção do local padrão
CREATE OR REPLACE FUNCTION prevent_default_local_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.id = 1 THEN
        RAISE EXCEPTION 'Não é permitido excluir o local padrão "Não Informado" (ID=1)';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para impedir deleção
DROP TRIGGER IF EXISTS prevent_default_local_delete_trigger ON locais;
CREATE TRIGGER prevent_default_local_delete_trigger
    BEFORE DELETE ON locais
    FOR EACH ROW
    EXECUTE FUNCTION prevent_default_local_delete();

-- Criar função para impedir alteração do código do local padrão
CREATE OR REPLACE FUNCTION prevent_default_local_code_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.id = 1 AND NEW.codigo != OLD.codigo THEN
        RAISE EXCEPTION 'Não é permitido alterar o código do local padrão "Não Informado" (ID=1)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para impedir alteração do código
DROP TRIGGER IF EXISTS prevent_default_local_code_change_trigger ON locais;
CREATE TRIGGER prevent_default_local_code_change_trigger
    BEFORE UPDATE ON locais
    FOR EACH ROW
    EXECUTE FUNCTION prevent_default_local_code_change();

-- Comentários para documentação
COMMENT ON TRIGGER prevent_default_local_delete_trigger ON locais IS 
'Impede a exclusão do local padrão (ID=1) para manter integridade referencial';

COMMENT ON TRIGGER prevent_default_local_code_change_trigger ON locais IS 
'Impede a alteração do código do local padrão (ID=1) para manter consistência';
