# CRUD Sequências de Documentos

## Descrição
Sistema para gerenciar sequências numéricas de documentos por empresa. Permite configurar numeração automática para diferentes tipos de documentos (NFe, Pedidos, Ajustes, etc).

## Estrutura

### Backend

**Model** (`/backend/app/modules/configuracoes/models/sequencia.py`)
```python
class Sequencia:
    - id: Integer (PK, auto-increment)
    - documento_tipo: String(50) - Tipo do documento
    - numero: Integer - Número atual (padrão: 1)
    - serie: String(10) - Série do documento (opcional)
    - numero_maximo: Integer - Limite máximo (padrão: 999999)
    - empresa_id: Integer (FK -> empresas.id)
```

**Schemas** (`/backend/app/modules/configuracoes/schemas/sequencia.py`)
- `SequenciaBase`: documento_tipo, numero (≥1), serie, numero_maximo (≥1)
- `SequenciaCreate`: + empresa_id
- `SequenciaUpdate`: todos campos opcionais
- `SequenciaInDB`: + id, empresa_id

**Repository** (`/backend/app/modules/configuracoes/repositories/sequencia.py`)
- `get_by_empresa(empresa_id, skip, limit)`: Lista sequências por empresa
- `get_by_documento_tipo(empresa_id, documento_tipo, serie)`: Busca específica

**Endpoints** (`/backend/app/modules/configuracoes/endpoints/sequencias.py`)
- `GET /api/v1/configuracoes/sequencias/` - Listar (filtro por empresa_id)
- `GET /api/v1/configuracoes/sequencias/{id}` - Buscar por ID
- `POST /api/v1/configuracoes/sequencias/` - Criar nova sequência
- `PUT /api/v1/configuracoes/sequencias/{id}` - Atualizar sequência
- `DELETE /api/v1/configuracoes/sequencias/{id}` - Excluir sequência

**Validações:**
- Previne duplicação: (empresa_id + documento_tipo + serie) deve ser único
- numero e numero_maximo devem ser ≥ 1
- documento_tipo é obrigatório (max 50 caracteres)
- serie é opcional (max 10 caracteres)

### Frontend

**Types** (`/frontend/features/configuracoes/types/sequencia.ts`)
```typescript
interface Sequencia {
  id: number;
  documento_tipo: string;
  numero: number;
  serie?: string;
  numero_maximo: number;
  empresa_id: number;
}
```

**Service** (`/frontend/features/configuracoes/services/sequencia.service.ts`)
- `getAll(params?)`: Lista sequências (suporta empresa_id, skip, limit)
- `getById(id)`: Busca por ID
- `create(data)`: Cria nova sequência
- `update(id, data)`: Atualiza sequência
- `delete(id)`: Exclui sequência

**Component** (`/frontend/features/configuracoes/components/SequenciasCRUD.tsx`)
- Tabela com colunas: Tipo de Documento, Série, Número Atual, Número Máximo, Ações
- Formulário inline para criar/editar
- Modal de confirmação para exclusão
- Filtra automaticamente pela empresa ativa
- Responsivo (mobile-first)

**Page** (`/frontend/pages/configuracoes/sequencias.tsx`)
- Obtém empresa ativa do AuthContext
- Renderiza SequenciasCRUD com empresaId
- Exibe mensagem se nenhuma empresa selecionada

### Database

**Tabela:** `sequencias`
```sql
CREATE TABLE sequencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documento_tipo VARCHAR(50) NOT NULL,
    numero INTEGER NOT NULL DEFAULT 1,
    serie VARCHAR(10),
    numero_maximo INTEGER NOT NULL DEFAULT 999999,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT chk_numero CHECK (numero >= 1),
    CONSTRAINT chk_numero_maximo CHECK (numero_maximo >= 1),
    CONSTRAINT uq_sequencia_empresa_tipo_serie UNIQUE (empresa_id, documento_tipo, serie)
);
```

**Índices:**
- `idx_sequencias_empresa` em empresa_id
- `idx_sequencias_documento_tipo` em documento_tipo

**Migration:** `/backend/migrations/create_sequencias_table.sql`

## Funcionalidades

### Criar Sequência
1. Clicar em "Nova Sequência"
2. Preencher:
   - **Tipo de Documento** (obrigatório): Ex: NFe, Pedido, Ajuste
   - **Número Atual** (obrigatório): Número inicial (padrão: 1)
   - **Série** (opcional): Ex: 1, A, 001
   - **Número Máximo** (obrigatório): Limite (padrão: 999999)
3. Clicar em "Salvar"

### Editar Sequência
1. Clicar no ícone de editar (lápis)
2. Modificar campos desejados
3. Clicar em "Salvar"

### Excluir Sequência
1. Clicar no ícone de excluir (lixeira)
2. Confirmar exclusão no modal

## CSS Pattern

Segue o padrão definido em `padrao_css.txt`:

- **Cor primária:** #556b2f (verde oliva)
- **Container:** `.sequencias-crud` com padding 2rem, max-width 90%
- **Header:** Título (1.875rem) + descrição (0.875rem) + botão "Nova"
- **Tabela:** Cabeçalho fixo, hover nas linhas, responsiva
- **Formulário:** Inline, grupos com labels, campos validados
- **Botões:**
  - `.btn-new`: Verde primário
  - `.btn-edit`: Azul (#1e40af)
  - `.btn-delete`: Vermelho (#991b1b)
  - `.btn-submit`: Verde primário
  - `.btn-cancel`: Cinza (#f3f4f6)
- **Mobile:** Breakpoint 768px, layout em coluna única

## Navegação

**Menu:** Configurações > Sequências
**Rota:** `/configuracoes/sequencias`
**Acesso:** Requer empresa ativa no sistema

## Casos de Uso

1. **Numeração de Notas Fiscais:**
   - Tipo: "NFe"
   - Série: "1"
   - Número: 1
   - Máximo: 999999

2. **Pedidos de Venda:**
   - Tipo: "Pedido de Venda"
   - Série: "" (sem série)
   - Número: 1001
   - Máximo: 999999

3. **Ajustes de Estoque:**
   - Tipo: "Ajuste de Estoque"
   - Série: "A"
   - Número: 1
   - Máximo: 99999

## Regras de Negócio

1. Cada empresa pode ter múltiplas sequências
2. Não pode haver duplicação de (empresa + tipo + série)
3. Números devem ser sempre positivos (≥ 1)
4. Ao excluir empresa, suas sequências são excluídas (CASCADE)
5. Série é opcional - útil para diferenciar sequências do mesmo tipo
6. Número máximo permite controle de limite de numeração

## Testes

### Backend
```bash
# Criar sequência
curl -X POST http://localhost:8000/api/v1/configuracoes/sequencias/ \
  -H "Content-Type: application/json" \
  -d '{"documento_tipo":"NFe","numero":1,"serie":"1","numero_maximo":999999,"empresa_id":1}'

# Listar por empresa
curl http://localhost:8000/api/v1/configuracoes/sequencias/?empresa_id=1

# Atualizar
curl -X PUT http://localhost:8000/api/v1/configuracoes/sequencias/1 \
  -H "Content-Type: application/json" \
  -d '{"numero":100}'

# Excluir
curl -X DELETE http://localhost:8000/api/v1/configuracoes/sequencias/1
```

### Frontend
1. Acessar http://localhost:3000/configuracoes/sequencias
2. Verificar se lista vazia aparece corretamente
3. Criar nova sequência
4. Verificar se aparece na tabela
5. Editar sequência
6. Excluir com confirmação
7. Testar responsividade no mobile

## Melhorias Futuras

- [ ] Incremento automático do número ao gerar documento
- [ ] Histórico de alterações
- [ ] Validação de número máximo não ultrapassado
- [ ] Múltiplas empresas: separação visual por empresa
- [ ] Exportação de configurações
- [ ] Templates de sequências padrão
- [ ] Reset de numeração por período
