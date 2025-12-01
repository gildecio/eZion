# Teste de Integração Completo - eZion ERP

Este arquivo contém um conjunto abrangente de testes de integração que validam todas as funcionalidades principais do sistema eZion ERP.

## Funcionalidades Testadas

### 🔐 Autenticação
- Login com credenciais válidas
- Controle de acesso baseado em tokens JWT
- Tratamento de erros de autenticação

### 🏢 Gestão de Empresas
- Listagem de empresas cadastradas
- Validação de dados de empresa

### ⚙️ Configurações
- **Sequências**: CRUD completo (Criar, Listar, Atualizar, Excluir)
- Controle de numeração automática de documentos

### 📦 Gestão de Estoque
- **Unidades**: CRUD completo
- **Grupos de Itens**: CRUD completo
- **Embalagens**: CRUD completo com fatores de conversão
- **Locais**: CRUD completo
- **Itens**: CRUD completo com relacionamentos
- **Lotes**: CRUD completo com controle de validade
- **Saldos**: Consulta de saldos por item/local
- **Movimentações**: Histórico de movimentações

### 📋 Requisições de Estoque
- Criação de requisições
- Controle de itens solicitados
- Embalagens e quantidades

### 🔧 Ajustes de Estoque
- Entradas e saídas manuais
- Controle por motivo
- Validação de quantidades

### 🛒 Vendas
- **Clientes**: CRUD completo
- **Pedidos**: Criação e controle de pedidos de venda

## Como Executar os Testes

### Pré-requisitos
1. **Servidor Backend Rodando**: O backend deve estar executando na porta 8000
2. **Banco de Dados**: Com dados básicos (empresa, usuário admin)
3. **Python**: Com pytest instalado

### Instalação de Dependências de Teste
```bash
cd backend
source .venv/bin/activate  # ou .venv_new/bin/activate
pip install pytest requests
```

### Execução dos Testes

#### Opção 1: Executar com pytest (recomendado)
```bash
cd backend
source .venv/bin/activate
python -m pytest test_integration.py -v
```

#### Opção 2: Executar diretamente
```bash
cd backend
source .venv/bin/activate
python test_integration.py
```

#### Opção 3: Executar testes específicos
```bash
cd backend
source .venv/bin/activate
python -m pytest test_integration.py::TestEZionERPIntegration::test_03_authentication -v
```

## Estrutura dos Testes

Os testes seguem uma ordem lógica de dependências:

1. **Health Check**: Verifica se o servidor está respondendo
2. **Empresas**: Lista empresas (não requer auth)
3. **Autenticação**: Faz login e obtém token
4. **Configurações**: Testa sequências
5. **Estoques Básicos**: Unidades, grupos, embalagens, locais
6. **Itens**: CRUD completo de itens
7. **Clientes**: CRUD de clientes
8. **Operações de Estoque**: Saldos, movimentações, requisições, ajustes
9. **Vendas**: Pedidos de venda
10. **Relatórios**: Endpoints de consulta
11. **Tratamento de Erros**: Validação de segurança

## Dados de Teste

O teste cria dados temporários durante a execução e os remove ao final, garantindo que não polua o banco de dados de produção.

### Credenciais de Teste
- **Usuário**: `admin`
- **Senha**: `admin`
- **Empresa ID**: `1`

## Resultado Esperado

Quando todos os testes passam:
```
🚀 Iniciando Testes de Integração do eZion ERP
============================================================

📋 Executando: test_01_health_check
✅ Servidor está funcionando
✅ test_01_health_check: PASSOU

📋 Executando: test_02_empresas_list
✅ Empresas listadas: X empresa(s)
✅ test_02_empresas_list: PASSOU

[... outros testes ...]

============================================================
📊 RESULTADO FINAL:
✅ Testes Aprovados: 16
❌ Testes Reprovados: 0
Taxa de Sucesso: 100.0%
🎉 Todos os testes passaram! Sistema funcionando perfeitamente.
```

## Tratamento de Falhas

### Possíveis Problemas e Soluções

#### 1. Servidor não está rodando
```
Erro: Servidor não está acessível
Solução: Execute ./start.sh na raiz do projeto
```

#### 2. Credenciais inválidas
```
Erro: Falha no login
Solução: Verifique se o usuário admin existe no banco
```

#### 3. Banco de dados vazio
```
Erro: Deve haver pelo menos uma empresa cadastrada
Solução: Execute as migrações e crie uma empresa
```

#### 4. Dependências faltando
```
Erro: ModuleNotFoundError
Solução: pip install -r requirements.txt
```

## Cobertura de Testes

### ✅ Funcionalidades 100% Testadas
- Autenticação JWT
- CRUD completo de todas as entidades
- Validações de negócio
- Controle de acesso
- Tratamento de erros
- Consultas e relatórios

### 🔄 Funcionalidades Parcialmente Testadas
- Integrações entre módulos
- Workflows completos (compra → estoque → venda)

### ❌ Funcionalidades Não Testadas
- Interface gráfica (frontend)
- Relatórios avançados
- Integrações externas
- Performance sob carga

## Manutenção

### Adicionando Novos Testes
1. Adicione métodos `test_XX_descricao` na classe `TestEZionERPIntegration`
2. Siga a ordem numérica para manter a sequência lógica
3. Use dados de teste únicos para evitar conflitos
4. Sempre limpe os dados criados no teste

### Exemplo de Novo Teste
```python
def test_XX_nova_funcionalidade(self):
    """Testa nova funcionalidade"""
    # Criar dados de teste
    # Executar operação
    # Validar resultado
    # Limpar dados
    pass
```

## Logs e Debug

Os testes incluem logs detalhados para facilitar a identificação de problemas:

- ✅ Operações bem-sucedidas
- ❌ Erros com descrição detalhada
- 📊 Estatísticas finais

Para debug avançado, habilite logs do servidor:
```bash
tail -f /tmp/ezion-backend.log
```</content>
<parameter name="filePath">/home/gildecio/projetos/eZion/backend/TEST_README.md