export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
} as const;

export const API_ENDPOINTS = {
  // Contábil
  empresas: '/api/v1/contabil/empresas/',
  
  // Estoque
  itens: '/api/v1/estoque/itens/',
  grupos: '/api/v1/estoque/grupos/',
  unidades: '/api/v1/estoque/unidades/',
  embalagens: '/api/v1/estoque/embalagens/',
  locais: '/api/v1/estoque/locais/',
  lotes: '/api/v1/estoque/lotes/',
  movimentacoes: '/api/v1/estoque/movimentacoes/',
  saldos: '/api/v1/estoque/saldos/',
  
  // Vendas
  clientes: '/api/v1/vendas/clientes/',
  pedidos: '/api/v1/vendas/pedidos/',
} as const;
