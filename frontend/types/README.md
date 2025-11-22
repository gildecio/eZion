# Estrutura de Types Globais

Esta pasta contém types e interfaces que são usados em múltiplos módulos do sistema.

Para types específicos de um módulo, use `features/{modulo}/types/`.

## Exemplo

```typescript
// Types globais (usados em vários módulos)
export interface User {
  id: number;
  nome: string;
  email: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
```
