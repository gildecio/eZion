# eZion Backend - FastAPI

API backend para o sistema ERP eZion.

## 🚀 Tecnologias

- **FastAPI** - Framework web assíncrono de alta performance
- **SQLAlchemy** - ORM para Python
- **Pydantic** - Validação de dados e schemas
- **SQLite** - Banco de dados relacional
- **Uvicorn** - Servidor ASGI

## 📁 Estrutura do Projeto

```
backend/
├── app/
│   ├── api/v1/
│   │   └── api.py                # Router agregador
│   ├── modules/                  # Módulos de negócio
│   │   ├── contabil/            # Módulo contábil
│   │   │   ├── models/          # SQLAlchemy models
│   │   │   │   └── empresa.py
│   │   │   ├── schemas/         # Pydantic schemas
│   │   │   │   └── empresa.py
│   │   │   ├── repositories/    # CRUD operations
│   │   │   │   └── empresa.py
│   │   │   └── endpoints/       # API endpoints
│   │   │       └── empresas.py
│   │   └── vendas/              # Módulo vendas (estrutura preparada)
│   │       ├── models/
│   │       ├── schemas/
│   │       ├── repositories/
│   │       └── endpoints/
│   ├── core/
│   │   └── config.py            # Configurações
│   ├── db/
│   │   └── session.py           # Sessão do banco
│   └── repositories/
│       └── base.py              # CRUD genérico
├── main.py                      # Entry point da aplicação
├── requirements.txt             # Dependências
└── .env                         # Variáveis de ambiente
```

## 🏗️ Arquitetura

### Camadas

1. **API Layer** (`api/`)
   - Endpoints REST
   - Validação de requisições
   - Documentação automática (OpenAPI/Swagger)

2. **Repository Layer** (`repositories/`)
   - Padrão Repository para acesso a dados
   - CRUD genérico reutilizável
   - Queries otimizadas

3. **Model Layer** (`models/`)
   - Modelos SQLAlchemy (ORM)
   - Definição de tabelas e relacionamentos

4. **Schema Layer** (`schemas/`)
   - Validação com Pydantic
   - Serialização/Deserialização
   - DTOs (Data Transfer Objects)

5. **Core Layer** (`core/`)
   - Configurações
   - Utilitários compartilhados

## 🔧 Instalação

### 1. Verificar Python

```bash
python3 --version  # Requer Python 3.10+
```

### 2. Instalar pip (se necessário)

```bash
sudo apt install python3-pip  # Linux (Debian/Ubuntu)
# ou
brew install python3  # macOS (já inclui pip)
```

### 3. Criar ambiente virtual (recomendado)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate  # Windows
```

### 4. Instalar dependências

```bash
pip3 install -r requirements.txt
```

### 5. Configurar variáveis de ambiente

O arquivo `.env` já está criado com as configurações padrão.

## ▶️ Executar a API

```bash
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

A API estará disponível em:
- **Aplicação**: http://localhost:8000
- **Documentação Interativa (Swagger)**: http://localhost:8000/api/v1/docs
- **Documentação Alternativa (ReDoc)**: http://localhost:8000/api/v1/redoc
- **Health Check**: http://localhost:8000/health

## 📚 Endpoints Disponíveis

### Módulo Contábil - Empresas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/contabil/empresas` | Listar empresas |
| GET | `/api/v1/contabil/empresas/{id}` | Buscar empresa por ID |
| POST | `/api/v1/contabil/empresas` | Criar nova empresa |
| PUT | `/api/v1/contabil/empresas/{id}` | Atualizar empresa |
| DELETE | `/api/v1/contabil/empresas/{id}` | Deletar empresa |

### Exemplos de Uso

**Criar Empresa**
```bash
curl -X POST "http://localhost:8000/api/v1/contabil/empresas" \
  -H "Content-Type: application/json" \
  -d '{
    "razao_social": "Minha Empresa LTDA",
    "cnpj": "12345678000190",
    "ativo": true
  }'
```

**Listar Empresas**
```bash
curl "http://localhost:8000/api/v1/contabil/empresas?skip=0&limit=10&ativo=true"
```

**Buscar por ID**
```bash
curl "http://localhost:8000/api/v1/contabil/empresas/1"
```

**Atualizar Empresa**
```bash
curl -X PUT "http://localhost:8000/api/v1/contabil/empresas/1" \
  -H "Content-Type: application/json" \
  -d '{
    "razao_social": "Nova Razão Social",
    "ativo": false
  }'
```

**Deletar Empresa**
```bash
curl -X DELETE "http://localhost:8000/api/v1/contabil/empresas/1"
```

## 🎯 Recursos Implementados

### ✅ CRUD Completo
- Create, Read, Update, Delete para Empresas
- Paginação (skip/limit)
- Filtros por status (ativo)
- Validação de CNPJ único

### ✅ Validações
- CNPJ com 14 dígitos
- Validação de CNPJ duplicado
- Campos obrigatórios
- Limites de tamanho

### ✅ Performance
- SQLite com pool de conexões
- Índices em campos chave (id, cnpj, ativo)
- Queries otimizadas
- Repository pattern para reuso

### ✅ Documentação
- OpenAPI/Swagger automático
- Descrições em todos endpoints
- Exemplos de requisições
- Schemas detalhados

### ✅ CORS
- Configurado para frontend (localhost:3000)
- Suporta múltiplas origens
- Headers permitidos

## 🔐 Boas Práticas Implementadas

1. **Repository Pattern** - Separação de lógica de dados
2. **Dependency Injection** - FastAPI `Depends()`
3. **Type Hints** - Tipagem completa em Python
4. **Pydantic Models** - Validação automática
5. **HTTP Status Codes** - Códigos semânticos corretos
6. **Error Handling** - Tratamento de erros consistente
7. **Database Session Management** - Context managers
8. **Environment Variables** - Configuração via `.env`
9. **Code Organization** - Estrutura modular clara
10. **API Versioning** - `/api/v1/` preparado para evolução

## 📝 Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] Adicionar outros módulos (Vendas, Estoque)
- [ ] Implementar testes unitários (pytest)
- [ ] Adicionar migrations com Alembic
- [ ] Implementar cache (Redis)
- [ ] Adicionar logs estruturados
- [ ] Configurar CI/CD
- [ ] Implementar rate limiting
- [ ] Adicionar websockets para real-time
- [ ] Documentar com exemplos completos

## 🧪 Testando a API

Acesse http://localhost:8000/api/v1/docs e use a interface interativa do Swagger para testar todos os endpoints.
