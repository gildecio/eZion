# eZion ERP

Sistema ERP moderno e escalável construído com arquitetura full-stack TypeScript/Python.

## 🏗️ Arquitetura

### Frontend
- **Framework**: Next.js 16 (React 18)
- **Linguagem**: TypeScript
- **Estilo**: CSS Modules
- **Arquitetura**: Feature-based (modular)

### Backend
- **Framework**: FastAPI
- **Linguagem**: Python 3.10+
- **ORM**: SQLAlchemy
- **Banco de Dados**: SQLite (dev) → PostgreSQL (prod)

---

## 📂 Estrutura do Projeto

```
eZion/
├── frontend/              # Aplicação Next.js
│   ├── features/          # Módulos de negócio
│   │   ├── contabil/     # Módulo contábil
│   │   └── vendas/       # Módulo de vendas
│   ├── shared/           # Componentes compartilhados
│   ├── services/         # API client
│   └── utils/            # Utilitários
│
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── api/v1/      # Endpoints REST
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── repositories/ # CRUD operations
│   └── main.py          # Entry point
│
└── README.md            # Este arquivo
```

---

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ 
- Python 3.10+
- Git

### 1. Clone o Repositório
```bash
git clone https://github.com/gildecio/eZion.git
cd eZion
```

### 2. Backend (Terminal 1)
```bash
cd backend
./run.sh
# Ou manualmente:
# python3 -m venv .venv
# source .venv/bin/activate
# pip install -r requirements.txt
# uvicorn main:app --reload
```

API disponível em: **http://localhost:8000**  
Documentação: **http://localhost:8000/api/v1/docs**

### 3. Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em: **http://localhost:3000**

---

## 📚 Módulos Implementados

### ✅ Módulo Contábil

#### Frontend
- Interface de listagem de empresas
- Hook `useEmpresas` para gerenciamento de estado
- Formatação de CNPJ
- Validação de dados

#### Backend
- CRUD completo de Empresas
- Endpoints REST:
  - `GET /api/v1/contabil/empresas` - Listar
  - `GET /api/v1/contabil/empresas/{id}` - Buscar
  - `POST /api/v1/contabil/empresas` - Criar
  - `PUT /api/v1/contabil/empresas/{id}` - Atualizar
  - `DELETE /api/v1/contabil/empresas/{id}` - Deletar

**Entidades**: Empresa (id, razao_social, cnpj, ativo)

---

## 🎯 Funcionalidades

### Frontend
- ✅ Arquitetura feature-based escalável
- ✅ TypeScript com tipagem completa
- ✅ Components compartilhados (Layout, Sidebar, Dropdown)
- ✅ API client configurável
- ✅ Formatadores (CNPJ, CPF, moeda, data)
- ✅ Validadores (CNPJ, CPF, email)
- ✅ Path aliases (@/features/*, @/shared/*)
- ✅ Navegação com menu dropdown
- ✅ Design responsivo

### Backend
- ✅ API RESTful com FastAPI
- ✅ Repository Pattern (CRUD genérico)
- ✅ Validação com Pydantic
- ✅ ORM SQLAlchemy
- ✅ Documentação automática (OpenAPI/Swagger)
- ✅ CORS configurado
- ✅ Tratamento de erros
- ✅ Índices otimizados
- ✅ Paginação e filtros

---

## 📖 Documentação

### Frontend
- [README Frontend](frontend/README.md) - Guia completo
- [ARQUITETURA Frontend](frontend/ARQUITETURA.md) - Detalhes técnicos

### Backend
- [README Backend](backend/README.md) - Guia de instalação
- [ARQUITETURA Backend](backend/ARQUITETURA.md) - Design patterns
- [RESUMO Backend](backend/RESUMO.md) - Visão executiva

---

## 🔧 Scripts Disponíveis

### Frontend
```bash
npm run dev      # Desenvolvimento (port 3000)
npm run build    # Build de produção
npm start        # Iniciar produção
npm run lint     # Linting
```

### Backend
```bash
./run.sh                           # Script automático
uvicorn main:app --reload         # Desenvolvimento
uvicorn main:app --host 0.0.0.0   # Produção
```

---

## 🌐 URLs Importantes

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3000 | Aplicação web |
| Backend | http://localhost:8000 | API REST |
| Swagger | http://localhost:8000/api/v1/docs | Documentação interativa |
| ReDoc | http://localhost:8000/api/v1/redoc | Documentação alternativa |
| Health | http://localhost:8000/health | Status da API |

---

## 🛠️ Stack Tecnológica

### Frontend
- Next.js 16.0.3
- React 18
- TypeScript
- CSS Modules

### Backend
- FastAPI 0.109.0
- SQLAlchemy 2.0.25
- Pydantic 2.5.3
- Uvicorn 0.27.0
- SQLite (desenvolvimento)

### DevOps
- Git
- Environment variables (.env)
- Scripts de automação

---

## 📊 Arquitetura de Camadas

### Frontend
```
Pages → Features → Services → API
  ↓        ↓          ↓
Layout   Hooks    HTTP Client
  ↓        ↓
Shared   Utils
```

### Backend
```
Endpoints → Schemas → Repositories → Models → Database
    ↓         ↓           ↓
 Validation  DTOs    CRUD Pattern
```

---

## 🔐 Segurança

### Implementado
- ✅ Validação de entrada (Pydantic + TypeScript)
- ✅ CORS configurado
- ✅ Type safety completo
- ✅ SQL Injection prevention (ORM)
- ✅ Environment variables

### Roadmap
- [ ] Autenticação JWT
- [ ] RBAC (Role-Based Access Control)
- [ ] Rate limiting
- [ ] HTTPS/TLS
- [ ] Logging e monitoring

---

## 📈 Performance

### Frontend
- Server-side rendering (Next.js)
- Code splitting automático
- Image optimization
- Fast refresh (Turbopack)

### Backend
- Async/await nativo (FastAPI)
- Connection pooling
- Índices de banco otimizados
- Queries eficientes (SQLAlchemy)

---

## 🧪 Testes

### Estrutura Preparada

**Frontend**
```bash
# A implementar
npm test        # Jest + Testing Library
npm run e2e     # Playwright/Cypress
```

**Backend**
```bash
# A implementar
pytest                    # Unit tests
pytest --cov             # Coverage
pytest tests/integration # Integration
```

---

## 📝 Próximos Passos

### Features
- [ ] Módulo de Vendas (Clientes, Pedidos)
- [ ] Módulo de Estoque
- [ ] Dashboard com gráficos
- [ ] Relatórios e exportação

### Infraestrutura
- [ ] Autenticação e autorização
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Docker compose
- [ ] Migrations (Alembic)
- [ ] Cache (Redis)
- [ ] PostgreSQL (produção)

### UX/UI
- [ ] Design system completo
- [ ] Tema dark/light
- [ ] i18n (internacionalização)
- [ ] PWA support

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Convenções
- **Commits**: Conventional Commits (feat, fix, docs, etc)
- **Branches**: feature/, bugfix/, hotfix/
- **Code style**: ESLint (frontend) + Black (backend)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autor

**Gildecio**
- GitHub: [@gildecio](https://github.com/gildecio)

---

## 🙏 Agradecimentos

- FastAPI pela excelente documentação
- Next.js pela developer experience
- Comunidade open source

---

**eZion ERP - Sistema de gestão empresarial moderno e escalável 🚀**
