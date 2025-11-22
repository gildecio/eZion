export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
} as const;

export const API_ENDPOINTS = {
  // Contábil
  empresas: '/api/v1/contabil/empresas',
  
  // Vendas
  clientes: '/api/v1/vendas/clientes',
  pedidos: '/api/v1/vendas/pedidos',
} as const;
