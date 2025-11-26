import React, { useState } from 'react';
import { useMovimentacoes } from '../hooks/useMovimentacoes';
import { useItens } from '../hooks/useItens';
import { useLocais } from '../hooks/useLocais';
import { TipoMovimentacao } from '../types/movimentacao';
import type {
  MovimentacaoFilters,
} from '../types/movimentacao';
import { formatQuantity, parseDecimal } from '../../../utils/formatters';

export default function MovimentacoesCRUD() {
  const [filters, setFilters] = useState<MovimentacaoFilters>({});
  const [hasSearched, setHasSearched] = useState(false);
  const { movimentacoes, loading, error, fetchMovimentacoes } = useMovimentacoes(filters);
  const { itens } = useItens();
  const { locais } = useLocais();

  const handleFilterChange = (key: keyof MovimentacaoFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev } as any;
      if (value) {
        newFilters[key] = value;
      } else {
        delete newFilters[key];
      }
      return newFilters;
    });
  };

  const handleConsultar = () => {
    if (!filters.item_id) {
      alert('Por favor, selecione um item para consultar as movimentações.');
      return;
    }
    setHasSearched(true);
    fetchMovimentacoes(filters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTipoClass = (tipo: string) => {
    switch(tipo) {
      case TipoMovimentacao.ENTRADA:
        return 'badge-entrada';
      case TipoMovimentacao.SAIDA:
        return 'badge-saida';
      case TipoMovimentacao.TRANSFERENCIA:
        return 'badge-transferencia';
      case TipoMovimentacao.AJUSTE_ENTRADA:
      case TipoMovimentacao.AJUSTE_SAIDA:
        return 'badge-ajuste';
      default:
        return 'badge-ajuste';
    }
  };

  const getItemSelecionado = () => {
    if (filters.item_id) {
      const item = itens.find(i => i.id === filters.item_id);
      return item ? `${item.codigo} - ${item.descricao}` : '';
    }
    return '';
  };

  return (
    <div className="movimentacoes-crud">
      <div className="header">
        <div>
          <h1>Movimentações de Estoque</h1>
          <p>{getItemSelecionado() || 'Selecione um item para consultar as movimentações'}</p>
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

      <div className="filtros-section">
        <h3>Filtros</h3>
        <div className="filtros-grid">
          <div className="form-group">
            <label>Item *</label>
            <select
              value={filters.item_id || ''}
              onChange={(e) => handleFilterChange('item_id', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Selecione um item</option>
              {itens.map(item => (
                <option key={item.id} value={item.id}>{item.codigo} - {item.descricao}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Data Início</label>
            <input
              type="date"
              value={filters.data_inicio || ''}
              onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Data Fim</label>
            <input
              type="date"
              value={filters.data_fim || ''}
              onChange={(e) => handleFilterChange('data_fim', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Local</label>
            <select
              value={filters.local_id || ''}
              onChange={(e) => handleFilterChange('local_id', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Todos</option>
              {locais.map(local => (
                <option key={local.id} value={local.id}>{local.codigo} - {local.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tipo</label>
            <select
              value={filters.tipo_movimentacao || ''}
              onChange={(e) => handleFilterChange('tipo_movimentacao', e.target.value as TipoMovimentacao)}
            >
              <option value="">Todos</option>
              {Object.values(TipoMovimentacao).map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={handleConsultar} className="btn-consultar" disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
          </div>
        </div>
      </div>

      <div className="content">
        {!hasSearched ? (
          <div className="empty">Selecione um item e clique em "Consultar" para carregar as movimentações.</div>
        ) : loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <>
            {movimentacoes.length > 0 && movimentacoes[0].saldo_anterior !== undefined && (
              <div className="saldo-inicial-card">
                <div className="saldo-inicial-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                  </svg>
                  <span>Saldo Inicial</span>
                </div>
                <div className="saldo-inicial-valor">
                  {formatQuantity(movimentacoes[0].saldo_anterior)}
                  {movimentacoes[0].unidade_sigla && <span className="unidade"> {movimentacoes[0].unidade_sigla}</span>}
                </div>
              </div>
            )}
            <div className="table-wrapper">
              <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Número</th>
                  <th>Série</th>
                  <th>Lote</th>
                  <th>Local</th>
                  <th className="text-right">Qtd</th>
                  <th className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty">Nenhuma movimentação encontrada</td>
                  </tr>
                ) : (
                  movimentacoes.map((mov) => (
                    <tr key={mov.id}>
                      <td>{formatDate(mov.data_movimentacao)}</td>
                      <td>
                        <span className={`badge-tipo ${getTipoClass(mov.tipo)}`}>
                          {mov.tipo}
                        </span>
                      </td>
                      <td>{mov.numero || '-'}</td>
                      <td>{mov.serie || '-'}</td>
                      <td>{mov.lote_codigo || '-'}</td>
                      <td>{mov.local_nome || '-'}</td>
                      <td className="text-right quantidade-col">
                        {formatQuantity(mov.quantidade)} <span className="unidade-sigla">{mov.unidade_sigla || 'UN'}</span>
                      </td>
                      <td className="text-right saldo-col">
                        {mov.saldo_atual !== undefined ? formatQuantity(mov.saldo_atual) : '-'} <span className="unidade-sigla">{mov.unidade_sigla || 'UN'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      <style jsx>{`
        .movimentacoes-crud {
          padding: 2rem;
          max-width: 95%;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .btn-new {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #556b2f;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-new:hover {
          background: #6b8e23;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .btn-consultar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.5rem;
          background: #556b2f;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          justify-content: center;
        }

        .btn-consultar:hover:not(:disabled) {
          background: #6b8e23;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-consultar:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-container {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }

        .form-container h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }

        .btn-cancel,
        .btn-submit {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-submit {
          background: #556b2f;
          color: white;
        }

        .btn-submit:hover {
          background: #6b8e23;
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

        .unidade-sigla {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
          margin-left: 0.25rem;
        }

        td.valor {
          font-weight: 600;
          color: #059669;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        .empty {
          text-align: center;
          color: #9ca3af;
          padding: 3rem;
        }

        .badge-tipo {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-entrada {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-saida {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge-transferencia {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge-ajuste {
          background: #e0e7ff;
          color: #3730a3;
        }

        .saldo-inicial-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-left: 4px solid #0284c7;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .saldo-inicial-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0c4a6e;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .saldo-inicial-label svg {
          color: #0284c7;
        }

        .saldo-inicial-valor {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0c4a6e;
        }

        .saldo-inicial-valor .unidade {
          font-size: 0.875rem;
          font-weight: 500;
          color: #0369a1;
          margin-left: 0.25rem;
        }
      `}</style>
    </div>
  );
}
