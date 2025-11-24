-- Migration: Refatorar MovimentacaoEstoque
-- Remove campo documento, adiciona numero e serie
-- Atualiza constraint check do enum TipoMovimentacao

-- Remover coluna documento
ALTER TABLE movimentacoes_estoque DROP COLUMN IF EXISTS documento;

-- Adicionar colunas numero e serie
ALTER TABLE movimentacoes_estoque ADD COLUMN IF NOT EXISTS numero VARCHAR(50);
ALTER TABLE movimentacoes_estoque ADD COLUMN IF NOT EXISTS serie VARCHAR(10);

-- Criar índices nas novas colunas
CREATE INDEX IF NOT EXISTS idx_movimentacoes_estoque_numero ON movimentacoes_estoque(numero);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_estoque_serie ON movimentacoes_estoque(serie);

-- Atualizar constraint check do enum TipoMovimentacao
-- Primeiro remover a constraint existente
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'movimentacoes_estoque_tipo_check' 
        AND conrelid = 'movimentacoes_estoque'::regclass
    ) THEN
        ALTER TABLE movimentacoes_estoque DROP CONSTRAINT movimentacoes_estoque_tipo_check;
    END IF;
END $$;

-- Adicionar nova constraint com os valores atualizados
ALTER TABLE movimentacoes_estoque 
ADD CONSTRAINT movimentacoes_estoque_tipo_check 
CHECK (tipo IN ('Entrada', 'Saida', 'Transferencia', 'Ajuste Entrada', 'Ajuste Saida', 'Inventario', 'Producao', 'Devolucao'));

-- Comentários para documentação
COMMENT ON COLUMN movimentacoes_estoque.numero IS 'Número do documento de movimentação';
COMMENT ON COLUMN movimentacoes_estoque.serie IS 'Série do documento de movimentação';
