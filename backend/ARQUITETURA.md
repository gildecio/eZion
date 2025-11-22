# Arquitetura Backend - FastAPI

## 📋 Visão Geral

API RESTful de alta performance construída com FastAPI, seguindo princípios de Clean Architecture e padrões de design enterprise.

## 🏗️ Estrutura de Camadas

```
┌─────────────────────────────────────┐
│      API Layer (Endpoints)          │  ← Requisições HTTP
├─────────────────────────────────────┤
│      Schema Layer (Pydantic)        │  ← Validação/Serialização
├─────────────────────────────────────┤
│   Repository Layer (CRUD Pattern)   │  ← Lógica de Dados
├─────────────────────────────────────┤
│     Model Layer (SQLAlchemy)        │  ← ORM/Mapeamento
├─────────────────────────────────────┤
│       Database (SQLite)             │  ← Persistência
└─────────────────────────────────────┘
```

## 📁 Organização de Arquivos

### Estrutura Modular

```
app/
├── api/v1/
│   └── api.py                    # Agregador de rotas da versão 1 da API
├── modules/                      # Módulos de negócio (feature-based)
│   ├── contabil/                # Módulo Contábil
│   │   ├── models/              # Modelos SQLAlchemy do módulo
│   │   │   └── empresa.py
│   │   ├── schemas/             # Schemas Pydantic (DTOs)
│   │   │   └── empresa.py
│   │   ├── repositories/        # Camada de acesso a dados
│   │   │   └── empresa.py
│   │   └── endpoints/           # Endpoints da API REST
│   │       └── empresas.py
│   └── vendas/                  # Módulo Vendas (estrutura preparada)
│       ├── models/
│       ├── schemas/
│       ├── repositories/
│       └── endpoints/
├── core/
│   └── config.py                # Configurações centralizadas (Pydantic Settings)
├── db/
│   └── session.py               # Engine, SessionLocal e Base do SQLAlchemy
└── repositories/
    └── base.py                  # CRUD genérico base para todos os repositórios
```

**Organização por Módulo de Negócio**:
Cada módulo (contabil, vendas, etc.) contém:
- **models/**: Entidades do banco de dados (SQLAlchemy)
- **schemas/**: DTOs para validação de entrada/saída (Pydantic)
- **repositories/**: Lógica de acesso a dados (Repository Pattern)
- **endpoints/**: Rotas da API REST (FastAPI)

**Benefícios**:
- ✅ **Coesão**: Todo código relacionado a um domínio fica junto
- ✅ **Separação de Concerns**: Módulos independentes
- ✅ **Escalabilidade**: Fácil adicionar novos módulos
- ✅ **Consistência**: Espelha estrutura modular do frontend

### 1. **API Layer** (`app/modules/{module}/endpoints/`)
**Responsabilidade**: Expor endpoints REST

```python
# app/modules/contabil/endpoints/empresas.py
@router.get("/")           # Lista
@router.get("/{id}")       # Busca
@router.post("/")          # Cria
@router.put("/{id}")       # Atualiza
@router.delete("/{id}")    # Deleta
```

**Características**:
- Versionamento de API (`/api/v1/`)
- Documentação automática (OpenAPI)
- Validação de entrada via Pydantic
- Códigos HTTP semânticos
- Tratamento de erros centralizado

### 2. **Schema Layer** (`app/modules/{module}/schemas/`)
**Responsabilidade**: Validação e serialização de dados

```python
# app/modules/contabil/schemas/empresa.py
EmpresaBase      # Campos comuns
EmpresaCreate    # Criação (sem ID)
EmpresaUpdate    # Atualização (campos opcionais)
EmpresaInDB      # Modelo completo do banco
EmpresaResponse  # Resposta da API
```

**Características**:
- Validação automática com Pydantic
- Type hints completos
- Validators customizados (ex: CNPJ)
- Serialização JSON automática

### 3. **Repository Layer** (`app/repositories/`)
**Responsabilidade**: Abstração de acesso a dados

```python
# app/repositories/base.py
CRUDBase[Model, CreateSchema, UpdateSchema]
  - get(id)              # Busca por ID
  - get_multi(filters)   # Lista com filtros
  - create(obj_in)       # Cria novo
  - update(db_obj, obj_in) # Atualiza existente
  - delete(id)           # Remove
  - count(filters)       # Conta registros
```

**Características**:
- Repository pattern genérico
- Reutilização via generics
- Queries otimizadas
- Tratamento de integridade

### 4. **Model Layer** (`app/modules/{module}/models/`)
**Responsabilidade**: Mapeamento objeto-relacional

```python
# app/modules/contabil/models/empresa.py
class Empresa(Base):
    __tablename__ = "empresas"
    id = Column(Integer, primary_key=True, index=True)
    razao_social = Column(String(255), nullable=False)
    cnpj = Column(String(14), unique=True, index=True)
    ativo = Column(Boolean, default=True, index=True)
```

**Características**:
- SQLAlchemy ORM
- Índices em campos críticos
- Constraints de integridade
- Relacionamentos (preparado para FK)

### 5. **Core Layer** (`app/core/`)
**Responsabilidade**: Configurações globais

```python
# app/core/config.py
Settings:
  - API_V1_STR
  - DATABASE_URL
  - CORS_ORIGINS
  - DEBUG
```

## 🎯 Padrões Implementados

### 1. Repository Pattern
**Objetivo**: Abstrair acesso a dados

```python
# Uso
empresa = empresa_repo.get(db, id=1)
empresas = empresa_repo.get_multi(db, skip=0, limit=10)
```

**Benefícios**:
- ✅ Testabilidade (mock repositories)
- ✅ Reutilização de código
- ✅ Separação de responsabilidades
- ✅ Queries centralizadas

### 2. Dependency Injection
**Objetivo**: Injetar dependências automaticamente

```python
def create_empresa(
    empresa_in: EmpresaCreate,
    db: Session = Depends(get_db)  # ← Injetado
):
```

**Benefícios**:
- ✅ Desacoplamento
- ✅ Facilita testes
- ✅ Gerenciamento de recursos (DB sessions)

### 3. DTO (Data Transfer Objects)
**Objetivo**: Separar modelos de banco e API

```
Request → EmpresaCreate → Empresa (Model) → EmpresaResponse → Response
```

**Benefícios**:
- ✅ Validação de entrada
- ✅ Controle de campos expostos
- ✅ Versionamento de API

### 4. Generic CRUD
**Objetivo**: Reutilizar operações CRUD

```python
CRUDBase[Empresa, EmpresaCreate, EmpresaUpdate]
```

**Benefícios**:
- ✅ DRY (Don't Repeat Yourself)
- ✅ Consistência
- ✅ Menos código boilerplate

## 🚀 Performance

### Otimizações Implementadas

1. **Índices de Banco de Dados**
```python
id = Column(Integer, primary_key=True, index=True)
cnpj = Column(String(14), unique=True, index=True)
ativo = Column(Boolean, index=True)
```

2. **Paginação Padrão**
```python
skip: int = 0
limit: int = 100  # Máximo: 1000
```

3. **Connection Pooling**
```python
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True  # Verifica conexões
)
```

4. **Lazy Loading**
- FastAPI carrega endpoints sob demanda
- SQLAlchemy lazy loading de relacionamentos

### Métricas Esperadas

- **Latência**: < 50ms (queries simples)
- **Throughput**: > 1000 req/s (com uvicorn)
- **Concorrência**: Assíncrono (FastAPI/Uvicorn)

## 🔒 Segurança

### Implementado

1. **Validação de Entrada**
```python
@field_validator('cnpj')
def validate_cnpj(cls, v: str) -> str:
    # Validação de formato e unicidade
```

2. **CORS Configurado**
```python
allow_origins = ["http://localhost:3000"]
allow_methods = ["*"]
allow_headers = ["*"]
```

3. **Type Safety**
- Type hints em 100% do código
- Pydantic validação automática

### A Implementar

- [ ] Autenticação JWT
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] SQL Injection prevention (SQLAlchemy protege)
- [ ] HTTPS/TLS

## 📊 Fluxo de Requisição

```
1. Cliente HTTP
   ↓
2. FastAPI Router
   ↓
3. Pydantic Validation (Schema)
   ↓
4. Endpoint Handler
   ↓
5. Repository (CRUD)
   ↓
6. SQLAlchemy Model
   ↓
7. Database Query
   ↓
8. Response (Schema)
   ↓
9. JSON Serialization
   ↓
10. HTTP Response
```

## 🧪 Testabilidade

### Estrutura Preparada

```python
# Mockable
db: Session = Depends(get_db)  # Mock session
empresa_repo.get()              # Mock repository

# Testável
schemas (Pydantic)              # Unit tests
repositories (CRUD)             # Integration tests
endpoints (API)                 # E2E tests
```

## 📈 Escalabilidade

### Horizontal

- **Stateless**: Sem sessões no servidor
- **Database**: SQLite → PostgreSQL/MySQL
- **Cache**: Adicionar Redis
- **Load Balancer**: Nginx/HAProxy

### Vertical

- **Async**: FastAPI é assíncrono
- **Workers**: Múltiplos processos Uvicorn
- **Connection Pool**: Configurável

## 🔧 Extensibilidade

### Adicionar Novo Módulo

1. Criar model em `models/`
2. Criar schemas em `schemas/`
3. Criar repository em `repositories/`
4. Criar endpoints em `api/v1/endpoints/`
5. Registrar router em `api/v1/api.py`

**Tempo estimado**: 15-30 minutos por entidade CRUD

## 📝 Convenções de Código

### Nomenclatura

- **Models**: PascalCase (Empresa)
- **Schemas**: PascalCase + sufixo (EmpresaCreate)
- **Repositories**: snake_case (empresa_repo)
- **Endpoints**: snake_case (get_empresa)

### Estrutura de Arquivos

```
nome_modulo/
  ├── model.py        # SQLAlchemy
  ├── schema.py       # Pydantic
  ├── repository.py   # CRUD
  └── endpoint.py     # FastAPI routes
```

## 🎓 Princípios Aplicados

### SOLID

- **S** - Single Responsibility: Cada camada tem uma responsabilidade
- **O** - Open/Closed: Genéricos permitem extensão sem modificação
- **L** - Liskov Substitution: Subclasses de CRUDBase
- **I** - Interface Segregation: Schemas específicos
- **D** - Dependency Inversion: Injeção de dependências

### Clean Architecture

- **Independência de Framework**: Lógica separada do FastAPI
- **Testável**: Camadas isoladas
- **Independência de UI**: API REST genérica
- **Independência de DB**: Repository abstrai SQLAlchemy

## 📚 Referências

- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)
- [SQLAlchemy Performance](https://docs.sqlalchemy.org/en/20/faq/performance.html)
- [Pydantic V2 Documentation](https://docs.pydantic.dev/latest/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
