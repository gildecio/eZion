# eZion - Frontend

Sistema ERP moderno construído com Next.js e TypeScript.

## 🏗️ Arquitetura

O projeto segue uma arquitetura escalável baseada em features/módulos de negócio, separando claramente as responsabilidades e facilitando a manutenção e evolução do sistema.

### Estrutura de Diretórios

```
frontend/
├── config/              # Configurações globais (API, ambiente, etc)
├── features/            # Módulos de negócio (feature-based)
│   ├── contabil/
│   │   ├── components/  # Componentes específicos do módulo
│   │   ├── hooks/       # Hooks customizados do módulo
│   │   ├── services/    # Serviços de API do módulo
│   │   └── types/       # Types/interfaces do módulo
│   └── vendas/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── shared/              # Componentes e recursos compartilhados
│   ├── components/      # Componentes genéricos reutilizáveis
│   ├── layouts/         # Layouts da aplicação
│   └── ui/              # Componentes de UI (botões, inputs, etc)
├── hooks/               # Hooks globais customizados
├── services/            # Serviços globais (API client, auth, etc)
├── utils/               # Funções utilitárias (formatters, validators)
├── types/               # Types/interfaces globais
├── pages/               # Páginas Next.js (apenas roteamento)
└── styles/              # Estilos globais
```

## 🎯 Conceitos Principais

### Feature-Based Architecture

Cada módulo de negócio (`contabil`, `vendas`, etc.) é autocontido com seus próprios:
- **Components**: Componentes específicos do domínio
- **Hooks**: Lógica de estado e efeitos colaterais
- **Services**: Comunicação com API
- **Types**: Definições de tipos TypeScript

**Vantagens:**
- ✅ Alta coesão e baixo acoplamento
- ✅ Fácil de entender e navegar
- ✅ Escalável para dezenas de módulos
- ✅ Facilita trabalho em equipe (menos conflitos)

### Camadas de Negócio

1. **Presentation Layer** (Components)
   - Componentes React responsáveis pela UI
   - Não contêm lógica de negócio complexa

2. **Business Logic Layer** (Hooks + Services)
   - Hooks: Gerenciam estado e efeitos colaterais
   - Services: Encapsulam comunicação com backend

3. **Data Layer** (Types)
   - Definições de tipos e interfaces
   - DTOs para requisições/respostas

## 📦 Path Aliases

Para facilitar imports, use os aliases configurados:

```typescript
import { Layout } from '@/shared/layouts'
import { formatCNPJ } from '@/utils/formatters'
import { empresaService } from '@/features/contabil/services'
import type { Empresa } from '@/features/contabil/types'
```

Aliases disponíveis:
- `@/components/*` - Componentes compartilhados
- `@/features/*` - Módulos de negócio
- `@/shared/*` - Recursos compartilhados
- `@/types/*` - Types globais
- `@/hooks/*` - Hooks globais
- `@/utils/*` - Utilitários
- `@/services/*` - Serviços globais
- `@/config/*` - Configurações
- `@/styles/*` - Estilos

## 🚀 Como Adicionar um Novo Módulo

1. Criar a estrutura de pastas em `features/`:
```bash
mkdir -p features/novo-modulo/{components,hooks,services,types}
```

2. Criar os types em `features/novo-modulo/types/`:
```typescript
// entidade.ts
export interface MinhaEntidade {
  id: number;
  nome: string;
}
```

3. Criar o service em `features/novo-modulo/services/`:
```typescript
// entidade.service.ts
import { apiClient } from '@/services/api-client';

export class EntidadeService {
  async getAll() { /* ... */ }
  async getById(id: number) { /* ... */ }
  // ...
}

export const entidadeService = new EntidadeService();
```

4. Criar os componentes necessários em `features/novo-modulo/components/`

5. Criar a página em `pages/novo-modulo/` que importa dos `features/`

## 🛠️ Utilitários Disponíveis

### Formatadores (`@/utils/formatters`)
- `formatCNPJ(cnpj: string)` - Formata CNPJ
- `formatCPF(cpf: string)` - Formata CPF
- `formatCurrency(value: number)` - Formata moeda (R$)
- `formatDate(date: Date | string)` - Formata data (DD/MM/YYYY)
- `formatDateTime(date: Date | string)` - Formata data e hora

### Validadores (`@/utils/validators`)
- `isValidCNPJ(cnpj: string)` - Valida CNPJ
- `isValidCPF(cpf: string)` - Valida CPF
- `isValidEmail(email: string)` - Valida email
- `isValidPhone(phone: string)` - Valida telefone

### API Client (`@/services/api-client`)
Cliente HTTP configurável para todas as requisições:

```typescript
import { apiClient } from '@/services/api-client';

// GET
const data = await apiClient.get<T>('/endpoint');

// POST
const result = await apiClient.post<T>('/endpoint', body);

// PUT, PATCH, DELETE também disponíveis
```

## 📝 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (`MinhaComponent.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useMinhaLógica.ts`)
- **Services**: camelCase com sufixo `.service` (`entidade.service.ts`)
- **Types**: PascalCase (`MinhaInterface.ts`)
- **Utils**: camelCase (`meuUtilitario.ts`)

### Organização de Imports
```typescript
// 1. React e bibliotecas externas
import React, { useState } from 'react';
import Link from 'next/link';

// 2. Aliases internos
import { Layout } from '@/shared/layouts';
import { empresaService } from '@/features/contabil/services';

// 3. Relativos (evitar quando possível)
import { ComponenteLocal } from './ComponenteLocal';

// 4. Styles
import styles from './styles.module.css';
```

### Exports
Prefira named exports em vez de default exports (exceto em pages e componentes principais):

```typescript
// ✅ Bom
export const empresaService = new EmpresaService();
export function formatCNPJ(cnpj: string) { }

// ❌ Evitar (exceto em pages/)
export default empresaService;
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Linting
npm run lint
```

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 Próximos Passos

- [ ] Implementar autenticação e autorização
- [ ] Adicionar testes unitários e de integração
- [ ] Configurar CI/CD
- [ ] Adicionar documentação de componentes (Storybook)
- [ ] Implementar i18n (internacionalização)
