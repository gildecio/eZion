# Sistema de Gestão de Estoque - eZion

## Visão Geral

Sistema completo de gestão de estoque com rastreamento de lotes, movimentações e saldos, implementando boas práticas de controle de inventário.

## Arquitetura

### Modelos de Dados

#### 1. Lote (`lotes`)
- **Propósito**: Rastrear lotes de produtos para controle de validade e rastreabilidade
- **Campos**:
  - `id`: Identificador único
  - `codigo`: Código do lote (único, indexado)
  - `data_fabricacao`: Data de fabricação (opcional)
  - `data_validade`: Data de validade (opcional, indexado)
  - `observacoes`: Informações adicionais
  - `created_at`, `updated_at`: Timestamps de auditoria

#### 2. MovimentacaoEstoque (`movimentacoes_estoque`)
- **Propósito**: Registrar todas as movimentações de estoque com auditoria completa
- **Campos**:
  - `id`: Identificador único
  - `item_id`: Referência ao item movimentado (FK)
  - `unidade_id`: Unidade de medida (FK)
  - `lote_id`: Lote associado (FK, opcional)
  - `local_origem_id`: Local de origem (FK, para transferências)
  - `local_destino_id`: Local de destino (FK)
  - `tipo_movimentacao`: Tipo de movimento (enum)
  - `quantidade`: Quantidade movimentada
  - `custo_unitario`: Custo por unidade
  - `custo_total`: Custo total calculado
  - `data_movimentacao`: Data do movimento
  - `observacoes`: Informações adicionais
  - `created_at`, `updated_at`: Timestamps

**Tipos de Movimentação**:
- `Entrada`: Entrada de mercadoria (compra, produção)
- `Saida`: Saída de mercadoria (venda, consumo)
- `Transferencia`: Transferência entre locais
- `Ajuste Positivo`: Ajuste de inventário para mais
- `Ajuste Negativo`: Ajuste de inventário para menos
- `Inventario`: Contagem física de inventário
- `Producao`: Saída por produção
- `Devolucao`: Devolução de mercadoria

**Índices**:
- `tipo_movimentacao`, `data_movimentacao` (para relatórios por período)
- `item_id`, `lote_id`, `local_origem_id`, `local_destino_id` (para consultas)

#### 3. SaldoEstoque (`saldos_estoque`)
- **Propósito**: Manter saldo atual de cada item por local e lote
- **Campos**:
  - `id`: Identificador único
  - `item_id`: Referência ao item (FK)
  - `local_id`: Local de armazenamento (FK)
  - `lote_id`: Lote (FK, opcional)
  - `quantidade`: Quantidade em estoque
  - `custo_medio`: Custo médio ponderado
  - `created_at`, `updated_at`: Timestamps

**Constraint**: Unique (`item_id`, `local_id`, `lote_id`) - previne duplicatas

**Índices**:
- Composite index em (`item_id`, `local_id`, `lote_id`)
- Individual indexes para consultas específicas

## Camadas da Aplicação

### 1. Repositories (`/backend/app/modules/estoque/repositories/`)

**LoteRepository** (`lote.py`):
- `get_by_codigo(codigo)`: Busca lote por código
- `get_validos(data_referencia)`: Retorna lotes válidos em determinada data
- CRUD padrão (get, get_multi, create, update, delete)

**MovimentacaoRepository** (`movimentacao.py`):
- `get_by_periodo(data_inicio, data_fim)`: Movimentações em período
- `get_by_item(item_id)`: Movimentações de um item
- `get_by_lote(lote_id)`: Movimentações de um lote
- CRUD padrão

**SaldoRepository** (`saldo.py`):
- `get_or_create(item_id, local_id, lote_id)`: Obtém ou cria saldo
- `atualizar_saldo(item_id, local_id, lote_id, quantidade, custo_unitario)`: Atualiza saldo com custo médio ponderado
- `get_com_filtros(item_id, local_id, lote_id)`: Consulta com filtros opcionais
- CRUD padrão

### 2. Service Layer (`/backend/app/modules/estoque/services/`)

**EstoqueService** (`estoque_service.py`):
Gerencia lógica de negócio para movimentações de estoque.

**Métodos Principais**:

1. **processar_entrada()**
   - Registra entrada de mercadoria
   - Atualiza saldo no local de destino
   - Calcula custo médio ponderado

2. **processar_saida()**
   - Valida disponibilidade de estoque
   - Registra saída
   - Atualiza saldo

3. **processar_transferencia()**
   - Valida estoque no local de origem
   - Registra movimento de transferência
   - Atualiza saldos em origem (diminui) e destino (aumenta)

4. **processar_ajuste()**
   - Registra ajustes positivos ou negativos
   - Atualiza saldo conforme ajuste
   - Permite correções de inventário

5. **validar_movimentacao()**
   - Valida regras de negócio
   - Verifica disponibilidade de estoque para saídas
   - Valida dados obrigatórios

**Regras de Negócio**:
- Saídas e transferências verificam estoque disponível
- Custo médio calculado automaticamente: `((saldo_atual * custo_medio_atual) + (quantidade_entrada * custo_unitario)) / (saldo_atual + quantidade_entrada)`
- Movimentações sempre atualizadas com custo_total = quantidade * custo_unitario

### 3. Endpoints (`/backend/app/modules/estoque/endpoints/`)

#### Lotes (`/api/v1/estoque/lotes/`)
- `GET /`: Lista todos os lotes
- `GET /{id}`: Detalhes de um lote
- `POST /`: Cria novo lote
- `PUT /{id}`: Atualiza lote
- `DELETE /{id}`: Remove lote

#### Movimentações (`/api/v1/estoque/movimentacoes/`)
- `GET /`: Lista movimentações (filtros opcionais: item_id, local_id, data_inicio, data_fim)
- `GET /{id}`: Detalhes de uma movimentação
- `POST /entrada`: Processa entrada de mercadoria
- `POST /saida`: Processa saída de mercadoria
- `POST /transferencia`: Processa transferência entre locais
- `POST /ajuste`: Processa ajuste de inventário

**Exemplo Entrada**:
```json
{
  "item_id": 1,
  "unidade_id": 1,
  "local_destino_id": 1,
  "lote_id": 1,
  "quantidade": 100,
  "custo_unitario": 10.50,
  "data_movimentacao": "2025-01-22",
  "observacoes": "Compra fornecedor X"
}
```

**Exemplo Transferência**:
```json
{
  "item_id": 1,
  "unidade_id": 1,
  "local_origem_id": 1,
  "local_destino_id": 2,
  "lote_id": 1,
  "quantidade": 50,
  "custo_unitario": 10.50,
  "data_movimentacao": "2025-01-22",
  "observacoes": "Transferência para filial"
}
```

#### Saldos (`/api/v1/estoque/saldos/`)
- `GET /`: Lista saldos (filtros opcionais: item_id, local_id, lote_id)
- Retorna dados detalhados com joins:
  - Nome do item, código
  - Nome do local
  - Código do lote
  - Valor total em estoque (quantidade * custo_medio)

**Exemplo Resposta**:
```json
{
  "id": 1,
  "item_id": 1,
  "item_nome": "Produto X",
  "item_codigo": "PROD001",
  "local_id": 1,
  "local_nome": "Almoxarifado Central",
  "lote_id": 1,
  "lote_codigo": "L001",
  "quantidade": 100,
  "custo_medio": 10.50,
  "valor_total": 1050.00
}
```

## Schemas Pydantic

Validação de dados com schemas separados:

- **LoteBase**: Campos base (codigo, datas, observacoes)
- **LoteCreate**: Para criação (herda Base)
- **LoteUpdate**: Para atualização (campos opcionais)
- **Lote**: Completo com id e timestamps (herda Base + Config orm_mode)

Mesma estrutura para MovimentacaoEstoque e SaldoEstoque.

## Boas Práticas Implementadas

1. **Rastreabilidade**: Todo movimento registrado com data, usuário (futuro), observações
2. **FIFO/FEFO**: Suporte a lotes permite controle por data de validade
3. **Custo Médio Ponderado**: Cálculo automático a cada entrada
4. **Validação**: Verificação de estoque disponível antes de saídas
5. **Auditoria**: Timestamps em todos os registros
6. **Performance**: Índices estratégicos para consultas frequentes
7. **Integridade**: Foreign keys e constraints garantem consistência
8. **Separação de Responsabilidades**: Repository → Service → Endpoint

## Próximos Passos (Frontend)

1. **Movimentações**:
   - Interface para registrar entradas, saídas e transferências
   - Filtros por período, item, tipo de movimento
   - Histórico de movimentações

2. **Saldos/Consultas**:
   - Dashboard de estoque atual
   - Alertas de estoque mínimo
   - Filtros por item, local, lote
   - Relatório de valor do estoque

3. **Relatórios**:
   - Movimentações por período
   - Curva ABC de produtos
   - Itens próximos à validade
   - Histórico de custo médio

4. **Gestão de Lotes**:
   - CRUD completo (já implementado no backend)
   - Vinculação com itens
   - Alertas de vencimento

## Testes Realizados

### Backend
✅ Servidor iniciado na porta 8000
✅ Endpoint `/api/v1/estoque/lotes/` GET retorna lista vazia
✅ Endpoint `/api/v1/estoque/lotes/` POST cria lote com sucesso:
   - Lote L001 criado (id=1)
   - Data fabricação: 2025-01-15
   - Data validade: 2026-01-15
✅ Migrações executadas com sucesso

### Banco de Dados
✅ Tabela `lotes` criada com 6 índices
✅ Tabela `movimentacoes_estoque` criada com 7 índices
✅ Tabela `saldos_estoque` criada com 5 índices + constraint unique

## Comandos Úteis

### Iniciar Backend
```bash
cd /home/gildecio/projetos/eZion/backend
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
```

### Testar Endpoints
```bash
# Listar lotes
curl http://localhost:8000/api/v1/estoque/lotes/

# Criar lote
curl -X POST http://localhost:8000/api/v1/estoque/lotes/ \
  -H "Content-Type: application/json" \
  -d '{"codigo":"L002","data_validade":"2026-12-31"}'

# Processar entrada
curl -X POST http://localhost:8000/api/v1/estoque/movimentacoes/entrada \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": 1,
    "unidade_id": 1,
    "local_destino_id": 1,
    "quantidade": 100,
    "custo_unitario": 15.00
  }'

# Consultar saldos
curl http://localhost:8000/api/v1/estoque/saldos/
```
