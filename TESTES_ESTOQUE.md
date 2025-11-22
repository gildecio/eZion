# Testes do Módulo de Estoque

## Backend - Testes de API

### Scripts de Teste Criados

1. **test_all_estoque.sh** - Teste completo de todas as entidades
   - Unidades
   - Grupos de Itens
   - Itens
   - Embalagens
   - Locais
   - Lotes
   - Movimentações (Entrada, Saída, Transferência, Ajuste)
   - Saldos
   - Validações de negócio

2. **test_crud_movimentacoes.sh** - Testes específicos de movimentações
   - Criação de movimentações de todos os tipos
   - Validações de regras de negócio
   - Verificação de saldos após movimentações

3. **test_crud_saldos.sh** - Testes de consulta de saldos
   - Listagem de saldos
   - Filtros por item e local
   - Consulta de saldos específicos

### Como Executar os Testes do Backend

```bash
cd backend

# Teste completo de todas as entidades
./test_all_estoque.sh

# Teste específico de movimentações
./test_crud_movimentacoes.sh

# Teste específico de saldos
./test_crud_saldos.sh
```

### Correções Implementadas

#### Problema: Enum TipoMovimentacao
- **Sintoma**: Erro 500 ao criar movimentações - "violates check constraint"
- **Causa**: Enum Python usava `ENTRADA` (maiúsculo) mas banco esperava `Entrada`
- **Solução**: Atualizado enum em:
  - `app/modules/estoque/models/movimentacao.py`
  - `app/modules/estoque/schemas/movimentacao.py`
  - `app/modules/estoque/services/estoque_service.py`

**Antes:**
```python
class TipoMovimentacao(str, enum.Enum):
    ENTRADA = "Entrada"
    SAIDA = "Saida"
    # ...
```

**Depois:**
```python
class TipoMovimentacao(str, enum.Enum):
    Entrada = "Entrada"
    Saida = "Saida"
    # ...
```

### Validações Testadas

✅ **Entrada de Estoque**
- Requer local de destino
- Permite custo unitário
- Atualiza saldo no local de destino

✅ **Saída de Estoque**
- Requer local de origem
- Valida saldo disponível
- Rejeita saída com saldo insuficiente
- Diminui saldo no local de origem

✅ **Transferência**
- Requer local de origem e destino
- Valida que origem ≠ destino
- Valida saldo disponível na origem
- Move mercadoria entre locais mantendo custo médio

✅ **Ajuste Positivo/Negativo**
- Permite correções de inventário
- Atualiza saldos conforme tipo de ajuste

### Fluxo de Dados Testado

```
1. Criar Item (ITEM-TEST-001)
   ↓
2. Criar Locais (Almoxarifado, Loja)
   ↓
3. Criar Lote (LOTE-TEST-001)
   ↓
4. Entrada: 100 unidades → Almoxarifado
   Saldo: Almoxarifado = 100
   ↓
5. Saída: 30 unidades ← Almoxarifado
   Saldo: Almoxarifado = 70
   ↓
6. Transferência: 20 unidades (Almoxarifado → Loja)
   Saldo: Almoxarifado = 50, Loja = 20
   ↓
7. Ajuste Positivo: +5 unidades → Almoxarifado
   Saldo: Almoxarifado = 55, Loja = 20
```

## Frontend - Testes de Componentes

### Testes Criados

1. **MovimentacoesCRUD.test.tsx**
   - Renderização da tabela
   - Filtros funcionais
   - Badges de tipo de movimentação
   - Formulário de registro
   - Estados de loading e erro
   - Validações de entrada

2. **SaldosCRUD.test.tsx**
   - Renderização de saldos
   - Cards de resumo (Total Itens, Quantidade, Valor)
   - Formatação de valores monetários
   - Alerta de estoque baixo
   - Filtros por item e local
   - Total geral no rodapé

### Como Executar os Testes do Frontend

```bash
cd frontend

# Instalar dependências de teste (se necessário)
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Executar todos os testes
npm test

# Executar testes específicos
npm test MovimentacoesCRUD
npm test SaldosCRUD

# Executar com coverage
npm test -- --coverage
```

### Cenários de Teste Frontend

#### MovimentacoesCRUD
- ✅ Lista movimentações com código, item, tipo, quantidade
- ✅ Badges coloridos por tipo (verde=entrada, vermelho=saída, etc)
- ✅ Filtros por item, local, tipo, período
- ✅ Formulário dinâmico (campos mudam conforme tipo)
- ✅ Validação de saldo antes de saída/transferência
- ✅ Estados de loading e erro

#### SaldosCRUD
- ✅ Lista saldos por item/local/lote
- ✅ Cards de resumo com totais
- ✅ Formatação BR (R$ 1.050,00)
- ✅ Alerta visual para estoque baixo (< 10 unidades)
- ✅ Total geral no rodapé
- ✅ Filtros reativos

## Integração Backend ↔ Frontend

### Endpoints Testados

| Método | Endpoint | Status | Descrição |
|--------|----------|--------|-----------|
| GET | `/api/v1/estoque/movimentacoes/` | ✅ | Lista movimentações |
| POST | `/api/v1/estoque/movimentacoes/` | ✅ | Cria movimentação |
| GET | `/api/v1/estoque/saldos/` | ✅ | Lista saldos |
| GET | `/api/v1/estoque/saldos/?item_id=X` | ✅ | Filtra por item |
| GET | `/api/v1/estoque/saldos/?local_id=X` | ✅ | Filtra por local |

### Formato de Requisição (Entrada)

```json
{
  "tipo": "Entrada",
  "item_id": 12,
  "quantidade": 100,
  "unidade_id": 1,
  "local_destino_id": 5,
  "custo_unitario": 50.0,
  "documento": "NF-001",
  "observacoes": "Compra de fornecedor",
  "usuario": "admin"
}
```

### Formato de Resposta (Saldo)

```json
{
  "id": 1,
  "item_id": 12,
  "item_codigo": "ITEM001",
  "item_nome": "Produto Teste",
  "local_id": 5,
  "local_nome": "Almoxarifado",
  "lote_id": 1,
  "lote_codigo": "L001",
  "quantidade": 100.0000,
  "custo_medio": 50.0000,
  "valor_total": 5000.0000
}
```

## Próximos Passos

### Testes Adicionais Recomendados

1. **Testes de Performance**
   - Movimentações em lote
   - Consulta de saldos com milhares de registros

2. **Testes de Concorrência**
   - Movimentações simultâneas no mesmo item/local
   - Race conditions no cálculo de saldo

3. **Testes E2E**
   - Fluxo completo: Login → Criar Item → Movimentar → Verificar Saldo
   - Navegação entre telas

4. **Testes de Validação**
   - Campos obrigatórios
   - Tipos de dados
   - Limites de valores

### Melhorias Identificadas

1. **Backend**
   - [ ] Adicionar transações para operações de movimentação
   - [ ] Implementar log de auditoria
   - [ ] Adicionar validação de datas (não permitir futuro)
   - [ ] Implementar soft delete para movimentações

2. **Frontend**
   - [ ] Adicionar confirmação antes de deletar
   - [ ] Implementar paginação na tabela
   - [ ] Adicionar exportação para Excel/PDF
   - [ ] Gráficos de movimentação por período
   - [ ] Dashboard com KPIs de estoque

## Status Geral

✅ **Backend API**: Funcional
✅ **Validações de Negócio**: Implementadas
✅ **Cálculo de Saldos**: Automático e correto
✅ **Frontend Components**: Criados e seguindo padrão
✅ **Testes Unitários**: Estruturados
⚠️ **Testes E2E**: Pendente
⚠️ **Performance**: Não testado em larga escala
