import React from 'react';
import { useEmpresas } from '../hooks';
import { formatCNPJ } from '@/utils/formatters';

/**
 * Componente de listagem de empresas
 * Exemplo de como usar a arquitetura feature-based
 */
export function EmpresasList() {
  const { empresas, loading, error, refresh } = useEmpresas();

  if (loading) {
    return <div>Carregando empresas...</div>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Erro: {error}</p>
        <button onClick={refresh}>Tentar novamente</button>
      </div>
    );
  }

  if (empresas.length === 0) {
    return <div>Nenhuma empresa cadastrada.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Empresas Cadastradas</h2>
        <button onClick={refresh}>Atualizar</button>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '0.5rem', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Razão Social</th>
            <th style={{ padding: '0.5rem', textAlign: 'left' }}>CNPJ</th>
            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((empresa) => (
            <tr key={empresa.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>{empresa.id}</td>
              <td style={{ padding: '0.5rem' }}>{empresa.razao_social}</td>
              <td style={{ padding: '0.5rem' }}>{formatCNPJ(empresa.cnpj)}</td>
              <td style={{ padding: '0.5rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px',
                  backgroundColor: empresa.ativo ? '#d4edda' : '#f8d7da',
                  color: empresa.ativo ? '#155724' : '#721c24',
                  fontSize: '0.875rem'
                }}>
                  {empresa.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
