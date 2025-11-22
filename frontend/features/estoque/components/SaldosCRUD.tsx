import React, { useState } from 'react';
import { useSaldos } from '../hooks/useSaldos';
import { useItens } from '../hooks/useItens';
import { useLocais } from '../hooks';
import type { SaldoFilters } from '../types/saldo';

export default function SaldosCRUD() {
  const [filters, setFilters] = useState<SaldoFilters>({});
  const { saldos, loading, error, getTotalValue } = useSaldos(filters);
  const { itens } = useItens();
  const { locais } = useLocais();

  const handleFilterChange = (key: keyof SaldoFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value) {
        newFilters[key] = Number(value);
      } else {
        delete newFilters[key];
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(value);
  };

  const totalValue = getTotalValue();
  const totalQuantidade = saldos.reduce((acc, s) => acc + s.quantidade, 0);

  return (
    <div className="saldos-crud">
      <div className="header">
        <div>
          <h1>Saldos de Estoque</h1>
          <p>Consulte o estoque atual e valores em estoque</p>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-section">
        <h3>Filtros</h3>
        <div className="filtros-grid">
          <div className="form-group">
            <label>Item</label>
            <select
              value={filters.item_id || ''}
              onChange={(e) => handleFilterChange('item_id', e.target.value)}
            >
              <option value="">Todos os itens</option>
              {itens.map(item => (
                <option key={item.id} value={item.id}>{item.codigo} - {item.descricao}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Local</label>
            <select
              value={filters.local_id || ''}
              onChange={(e) => handleFilterChange('local_id', e.target.value)}
            >
              <option value="">Todos os locais</option>
              {locais.map(local => (
                <option key={local.id} value={local.id}>{local.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group align-end">
            <button onClick={clearFilters} className="btn-clear">
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="content">
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : saldos.length === 0 ? (
          <div className="empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>Nenhum saldo encontrado</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Item</th>
                  <th>Local</th>
                  <th>Lote</th>
                  <th className="text-right">Quantidade</th>
                  <th>Unidade</th>
                </tr>
              </thead>
              <tbody>
                {saldos.map((saldo) => {
                  const valorTotal = saldo.valor_total || (saldo.quantidade * saldo.custo_medio);
                  const isLowStock = saldo.quantidade < 10;
                  return (
                    <tr key={saldo.id} className={isLowStock ? 'low-stock' : ''}>
                      <td>
                        <span className="badge-codigo">{saldo.item_codigo || '-'}</span>
                      </td>
                      <td>{saldo.item_descricao || '-'}</td>
                      <td>{saldo.local_nome || '-'}</td>
                      <td>{saldo.lote_codigo || '-'}</td>
                      <td className="text-right quantidade">
                        {formatNumber(saldo.quantidade)}
                        {isLowStock && (
                          <span className="warning-icon" title="Estoque baixo">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                          </span>
                        )}
                      </td>
                      <td>{saldo.unidade_padrao_sigla || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerta de Estoque Baixo */}
      {saldos.some(s => s.quantidade < 10) && (
        <div className="warning-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>Atenção:</strong> {saldos.filter(s => s.quantidade < 10).length} item(ns) com estoque baixo (menos de 10 unidades)
          </span>
        </div>
      )}

      <style jsx>{`
        .saldos-crud {
          padding: 2rem;
          max-width: 95%;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .header h1 {
          margin: 0;
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
        }

        .header p {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .header-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, #556b2f 0%, #6b8e23 100%);
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(85, 107, 47, 0.2);
        }

        .stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-top: 0.25rem;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          color: #c33;
          margin-bottom: 1.5rem;
        }

        .warning-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          color: #92400e;
          margin-top: 1.5rem;
        }

        .filtros-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }

        .filtros-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .filtros-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.align-end {
          justify-content: flex-end;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }

        .form-group select {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .form-group select:focus {
          outline: none;
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
        }

        .btn-clear {
          padding: 0.625rem 1.25rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-clear:hover {
          background: #e5e7eb;
        }

        .resumo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .resumo-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .resumo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 10px;
        }

        .resumo-icon.itens {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
        }

        .resumo-icon.quantidade {
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          color: #4338ca;
        }

        .resumo-icon.valor {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
        }

        .resumo-content {
          display: flex;
          flex-direction: column;
        }

        .resumo-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .resumo-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-top: 0.25rem;
        }

        .resumo-value.valor {
          color: #059669;
        }

        .content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty {
          text-align: center;
          padding: 3rem;
          color: #9ca3af;
        }

        .empty svg {
          margin: 0 auto 1rem;
          opacity: 0.5;
        }

        .empty p {
          margin: 0;
          font-size: 1rem;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f9fafb;
        }

        th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #e5e7eb;
        }

        th.text-right {
          text-align: right;
        }

        td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
          font-size: 0.875rem;
        }

        td.text-right {
          text-align: right;
        }

        td.quantidade {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        td.valor {
          font-weight: 600;
          color: #059669;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        tbody tr.low-stock {
          background: #fffbeb;
        }

        tbody tr.low-stock:hover {
          background: #fef3c7;
        }

        tfoot {
          background: #f9fafb;
          border-top: 2px solid #e5e7eb;
        }

        tfoot td {
          padding: 1rem;
          font-weight: 600;
          border: none;
        }

        .total-label {
          color: #374151;
          font-size: 0.875rem;
        }

        .total-valor {
          color: #059669;
          font-size: 1.125rem;
        }

        .badge-codigo {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .warning-icon {
          color: #f59e0b;
          display: inline-flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
