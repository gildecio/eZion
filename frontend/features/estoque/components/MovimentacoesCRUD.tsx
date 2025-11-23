import React, { useState } from 'react';
import { useMovimentacoes } from '../hooks/useMovimentacoes';
import { useItens } from '../hooks/useItens';
import { TipoMovimentacao } from '../types/movimentacao';
import type {
  MovimentacaoFilters,
} from '../types/movimentacao';

export default function MovimentacoesCRUD() {
  const [filters, setFilters] = useState<MovimentacaoFilters>({});
  
  const { movimentacoes, loading, error } = useMovimentacoes(filters);
  const { itens } = useItens();

  const [formData, setFormData] = useState<any>({
    item_id: '',
    unidade_id: 1,
    local_origem_id: '',
    local_destino_id: '',
    lote_id: '',
    quantidade: '',
    custo_unitario: '',
    data_movimentacao: new Date().toISOString().split('T')[0],
    observacoes: '',
  });


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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTipoClass = (tipo: string) => {
    switch(tipo) {
      case 'Entrada': 
      case TipoMovimentacao.ENTRADA: 
        return 'badge-entrada';
      case 'Saida': 
      case TipoMovimentacao.SAIDA: 
        return 'badge-saida';
      case 'Transferencia': 
      case TipoMovimentacao.TRANSFERENCIA: 
        return 'badge-transferencia';
      case 'Ajuste Positivo':
      case 'Ajuste Negativo':
      case TipoMovimentacao.AJUSTE_POSITIVO:
      case TipoMovimentacao.AJUSTE_NEGATIVO:
        return 'badge-ajuste';
      default: 
        return 'badge-ajuste';
    }
  };

  return (
    <div className="movimentacoes-crud">
      <div className="header">
        <div>
          <h1>Movimentações de Estoque</h1>
          <p>Consulte o histórico de movimentações de estoque</p>
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
            <label>Item</label>
            <select
              value={filters.item_id || ''}
              onChange={(e) => handleFilterChange('item_id', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Todos</option>
              {itens.map(item => (
                <option key={item.id} value={item.id}>{item.descricao}</option>
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
        </div>
      </div>

      <div className="content">
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Item</th>
                  <th>Lote</th>
                  <th>Saída</th>
                  <th>Entrada</th>
                  <th className="text-right">Qtd</th>
                  <th className="text-right">Saldo Atualizado</th>
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
                      <td>{mov.item_nome || '-'}</td>
                      <td>{mov.lote_codigo || '-'}</td>
                      <td>{mov.local_origem_nome || '-'}</td>
                      <td>{mov.local_destino_nome || '-'}</td>
                      <td className="text-right">{mov.quantidade} {mov.unidade_sigla}</td>
                      <td className="text-right saldo">{mov.saldo_atual !== undefined ? mov.saldo_atual : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
      `}</style>
    </div>
  );
}
