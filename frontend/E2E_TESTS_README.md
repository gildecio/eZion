# Testes E2E - eZion ERP Frontend

Este documento descreve os testes end-to-end (E2E) implementados para o frontend do eZion ERP.

## 📋 Visão Geral

Os testes E2E validam a funcionalidade completa do sistema através da interface do usuário, simulando interações reais do usuário. Eles cobrem:

- ✅ Autenticação e autorização
- ✅ Navegação entre módulos
- ✅ Funcionalidades CRUD básicas
- ✅ Responsividade e UX
- ✅ Tratamento de erros

## 🛠️ Tecnologias Utilizadas

- **Playwright**: Framework de testes E2E
- **Chromium**: Navegador para execução dos testes
- **JavaScript**: Linguagem dos scripts de teste

## 📁 Estrutura dos Testes

```
frontend/
├── e2e_tests.spec.js          # Arquivo principal de testes E2E
├── playwright.config.js       # Configuração do Playwright
├── run_e2e_tests.sh          # Script de execução automatizada
└── test-results/             # Relatórios de execução (gerado)
```

## 🚀 Como Executar

### Pré-requisitos

1. **Backend rodando** na porta 8000
2. **Frontend rodando** na porta 3000
3. **Dependências instaladas**:
   ```bash
   npm install
   npx playwright install
   ```

### Execução Automática (Recomendado)

```bash
./run_e2e_tests.sh
```

Este script:
- ✅ Verifica se backend e frontend estão rodando
- ✅ Executa todos os testes
- ✅ Gera relatórios automaticamente

### Execução Manual

```bash
# Executar todos os testes
npx playwright test

# Executar testes em modo interativo
npx playwright test --ui

# Executar testes com navegador visível (debug)
npx playwright test --headed

# Executar teste específico
npx playwright test e2e_tests.spec.js --grep "login"
```

## 📊 Relatórios

Após a execução, os relatórios ficam disponíveis em:

- **HTML Report**: `npx playwright show-report`
- **JSON Results**: `test-results.json`
- **JUnit XML**: `test-results.xml`

## 🧪 Cenários de Teste

### Autenticação
- ✅ Redirecionamento para login na página inicial
- ✅ Bloqueio de acesso sem autenticação
- ✅ Login com credenciais válidas

### Dashboard
- ✅ Carregamento correto da página
- ✅ Elementos de navegação visíveis

### Módulos do Sistema
- ✅ Configurações (Sequências)
- ✅ Contábil (Empresas)
- ✅ Estoque (Itens, Unidades, Grupos, etc.)
- ✅ Vendas (Clientes, Pedidos)

### Funcionalidades Gerais
- ✅ Navegação entre módulos
- ✅ Responsividade mobile
- ✅ Logout do sistema

### Casos de Erro
- ✅ Página 404
- ✅ Formulários com dados inválidos
- ✅ Performance de carregamento

## 🔧 Configuração

### playwright.config.js

```javascript
export default defineConfig({
  testDir: './',
  testMatch: '**/e2e_tests.spec.js',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
  },
  // ... outras configurações
});
```

## 🐛 Debugging

### Modo Interativo
```bash
npx playwright test --ui
```

### Com Navegador Visível
```bash
npx playwright test --headed --timeout=0
```

### Debug de Teste Específico
```bash
npx playwright test --grep "nome do teste" --debug
```

## 📈 CI/CD

Para integração contínua, adicione ao seu pipeline:

```yaml
- name: Run E2E Tests
  run: |
    cd frontend
    npm install
    npx playwright install
    ./run_e2e_tests.sh
```

## 🤝 Contribuição

### Adicionando Novos Testes

1. Adicione o teste no arquivo `e2e_tests.spec.js`
2. Siga o padrão de numeração sequencial
3. Inclua comentários descritivos
4. Teste em isolamento antes de commitar

### Boas Práticas

- ✅ Use seletores robustos (IDs, data-testid)
- ✅ Aguarde carregamentos com `waitForTimeout` quando necessário
- ✅ Valide estados visuais e funcionais
- ✅ Mantenha testes independentes
- ✅ Documente cenários complexos

## 📞 Suporte

Para dúvidas sobre os testes E2E:
- Verifique os logs de execução
- Use o modo debug para investigar falhas
- Consulte a documentação do Playwright: https://playwright.dev/