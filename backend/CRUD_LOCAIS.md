# CRUD de Locais - Módulo de Estoque

## Visão Geral

Implementação completa do CRUD de Locais de armazenamento no módulo de Estoque do sistema eZion. Os locais representam os lugares físicos onde os itens do estoque são armazenados (depósitos, armazéns, lojas, etc.).

## Estrutura de Dados

### Campos do Local

- **id**: Identificador único (gerado automaticamente)
- **codigo**: Código único do local (string, máx 20 caracteres) - obrigatório
- **nome**: Nome do local (string, máx 100 caracteres) - obrigatório
- **descricao**: Descrição detalhada do local (string, máx 255 caracteres) - opcional
- **ativo**: Indica se o local está ativo (boolean, padrão: true)

## Backend

### Arquivos Criados

1. **Model** (`/backend/app/modules/estoque/models/local.py`)
   - Define a estrutura da tabela `locais` no banco de dados
   - Relacionamentos preparados para uso futuro com movimentações de estoque

2. **Schema** (`/backend/app/modules/estoque/schemas/local.py`)
   - LocalBase: Schema base com todos os campos
   - LocalCreate: Schema para criação (todos os campos obrigatórios exceto descrição)
   - LocalUpdate: Schema para atualização (todos os campos opcionais)
   - LocalInDB: Schema de retorno com ID

3. **Repository** (`/backend/app/modules/estoque/repositories/local_repository.py`)
   - Métodos CRUD padrão
   - `get_by_codigo()`: Busca local por código único
   - `get_ativos()`: Retorna apenas locais ativos

4. **Endpoints** (`/backend/app/modules/estoque/endpoints/locais.py`)
   - GET `/api/v1/estoque/locais/` - Lista todos os locais (com filtro opcional `apenas_ativos`)
   - GET `/api/v1/estoque/locais/{id}` - Busca local por ID
   - POST `/api/v1/estoque/locais/` - Cria novo local
   - PUT `/api/v1/estoque/locais/{id}` - Atualiza local existente
   - DELETE `/api/v1/estoque/locais/{id}` - Remove local

5. **Migração** (`/backend/alembic/versions/004_create_locais.sql`)
   - Cria tabela `locais` no PostgreSQL
   - Índices em `codigo` e `ativo` para performance
   - Timestamps automáticos (created_at, updated_at)

### Validações Implementadas

- Código único (não permite duplicados)
- Verificação de existência ao editar/deletar
- Validação de tamanhos máximos de campos
- Campos obrigatórios

## Frontend

### Arquivos Criados

1. **Types** (`/frontend/features/estoque/types/local.ts`)
   - Interfaces TypeScript: Local, LocalCreate, LocalUpdate

2. **Service** (`/frontend/features/estoque/services/local-service.ts`)
   - Métodos para comunicação com a API
   - getAll(), getById(), create(), update(), delete()

3. **Component** (`/frontend/features/estoque/components/LocaisCRUD.tsx`)
   - Interface completa de gerenciamento
   - Formulário de criação/edição
   - Tabela de listagem com ações
   - Modal de confirmação de exclusão
   - Validações client-side
   - Badges de status (Ativo/Inativo)

4. **Page** (`/frontend/pages/estoque/locais.tsx`)
   - Página principal em `/estoque/locais`
   - Integra o componente LocaisCRUD com o Layout

5. **Navegação**
   - Link adicionado no menu Estoque da Sidebar
   - Rota configurada no Next.js

### Funcionalidades da Interface

- ✅ Criar novo local
- ✅ Listar locais cadastrados
- ✅ Editar local existente
- ✅ Excluir local (com confirmação)
- ✅ Ativar/desativar local
- ✅ Validação de formulário
- ✅ Feedback visual de operações
- ✅ Responsividade

## Testes Realizados

### Backend (via API)

```bash
# Criar local
curl -X POST http://localhost:8000/api/v1/estoque/locais/ \
  -H "Content-Type: application/json" \
  -d '{"codigo":"DEP01","nome":"Depósito Principal","descricao":"Depósito principal da empresa","ativo":true}'

# Listar locais
curl http://localhost:8000/api/v1/estoque/locais/

# Atualizar local
curl -X PUT http://localhost:8000/api/v1/estoque/locais/1 \
  -H "Content-Type: application/json" \
  -d '{"nome":"Depósito Central","ativo":false}'

# Filtrar apenas ativos
curl http://localhost:8000/api/v1/estoque/locais/?apenas_ativos=true

# Buscar por ID
curl http://localhost:8000/api/v1/estoque/locais/1
```

### Resultados

✅ Todos os testes passaram com sucesso
✅ CRUD completo funcionando
✅ Validações operando corretamente
✅ Filtros funcionando

## Próximos Passos Sugeridos

1. **Integração com Itens**: Adicionar campo `local_id` na tabela de itens
2. **Movimentações**: Criar histórico de movimentações entre locais
3. **Estoque por Local**: Controle de quantidade de cada item por local
4. **Relatórios**: Relatório de estoque por local
5. **Hierarquia**: Permitir locais pai/filho (ex: Depósito > Corredor > Prateleira)

## Documentação da API

A documentação interativa está disponível em:
- Swagger UI: http://localhost:8000/docs
- Seção: **Estoque - Locais**

## Banco de Dados

### Tabela: `locais`

```sql
CREATE TABLE locais (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices

- `idx_locais_codigo` em `codigo`
- `idx_locais_ativo` em `ativo`

## Autor

Implementado em 22/11/2025 como parte do módulo de Estoque do sistema eZion.
