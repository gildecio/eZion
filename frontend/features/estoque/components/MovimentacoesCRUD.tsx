import React, { useState, useEffect } from 'react';
import { useMovimentacoes } from '../hooks/useMovimentacoes';
import { useItens } from '../hooks/useItens';
import { useLocais } from '../hooks';
import { useLotes } from '../hooks/useLotes';
import { TipoMovimentacao } from '../types/movimentacao';
import type {
  MovimentacaoEstoque,
  CreateMovimentacaoEntradaDTO,
  CreateMovimentacaoSaidaDTO,
  CreateMovimentacaoTransferenciaDTO,
  CreateMovimentacaoAjusteDTO,
  MovimentacaoFilters,
} from '../types/movimentacao';

export default function MovimentacoesCRUD() {
  const [filters, setFilters] = useState<MovimentacaoFilters>({});
  const [showForm, setShowForm] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState<string>('Entrada');
  
  const { movimentacoes, loading, error, registrarEntrada, registrarSaida, registrarTransferencia, registrarAjuste, refresh } = useMovimentacoes(filters);
  const { itens } = useItens();
  const { locais } = useLocais();
  const { lotes } = useLotes();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const baseData = {
        item_id: Number(formData.item_id),
        unidade_id: Number(formData.unidade_id),
        quantidade: Number(formData.quantidade),
        custo_unitario: Number(formData.custo_unitario),
        data_movimentacao: formData.data_movimentacao,
        observacoes: formData.observacoes || undefined,
        lote_id: formData.lote_id ? Number(formData.lote_id) : undefined,
      };

      switch (tipoMovimentacao) {
        case 'Entrada':
          await registrarEntrada({
            ...baseData,
            local_destino_id: Number(formData.local_destino_id),
          } as CreateMovimentacaoEntradaDTO);
          break;
        case 'Saida':
          await registrarSaida({
            ...baseData,
            local_origem_id: Number(formData.local_origem_id),
          } as CreateMovimentacaoSaidaDTO);
          break;
        case 'Transferencia':
          await registrarTransferencia({
            ...baseData,
            local_origem_id: Number(formData.local_origem_id),
            local_destino_id: Number(formData.local_destino_id),
          } as CreateMovimentacaoTransferenciaDTO);
          break;
        case 'Ajuste Positivo':
          await registrarAjuste({
            ...baseData,
            tipo: 'Ajuste Positivo',
            local_destino_id: Number(formData.local_destino_id),
          } as CreateMovimentacaoAjusteDTO);
          break;
        case 'Ajuste Negativo':
          await registrarAjuste({
            ...baseData,
            tipo: 'Ajuste Negativo',
            local_origem_id: Number(formData.local_origem_id),
          } as CreateMovimentacaoAjusteDTO);
          break;
      }

      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error('Erro ao processar movimentação:', err);
    }
  };

  const resetForm = () => {
    setFormData({
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
  };

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

  useEffect(() => {
    refresh(filters);
  }, [filters]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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
          <p>Registre e consulte todas as movimentações de estoque</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-new">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Movimentação
          </button>
        )}
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
      {!showForm && (
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
      )}

      {showForm ? (
        <div className="form-container">
          <h2>Nova Movimentação</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tipo de Movimentação *</label>
              <select
                value={tipoMovimentacao}
                onChange={(e) => setTipoMovimentacao(e.target.value)}
                required
              >
                <option value="Entrada">Entrada</option>
                <option value="Saida">Saída</option>
                <option value="Transferencia">Transferência</option>
                <option value="Ajuste Positivo">Ajuste Positivo</option>
                <option value="Ajuste Negativo">Ajuste Negativo</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Item *</label>
                <select
                  value={formData.item_id}
                  onChange={(e) => setFormData({...formData, item_id: e.target.value})}
                  required
                >
                  <option value="">Selecione...</option>
                  {itens.map(item => (
                    <option key={item.id} value={item.id}>{item.descricao}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Lote</label>
                <select
                  value={formData.lote_id}
                  onChange={(e) => setFormData({...formData, lote_id: e.target.value})}
                >
                  <option value="">Sem lote</option>
                  {lotes.map(lote => (
                    <option key={lote.id} value={lote.id}>{lote.codigo}</option>
                  ))}
                </select>
              </div>
            </div>

            {(tipoMovimentacao === 'Saida' || tipoMovimentacao === 'Transferencia') && (
              <div className="form-group">
                <label>Local de Origem *</label>
                <select
                  value={formData.local_origem_id}
                  onChange={(e) => setFormData({...formData, local_origem_id: e.target.value})}
                  required
                >
                  <option value="">Selecione...</option>
                  {locais.map(local => (
                    <option key={local.id} value={local.id}>{local.nome}</option>
                  ))}
                </select>
              </div>
            )}

            {(tipoMovimentacao === 'Entrada' || tipoMovimentacao === 'Transferencia' || tipoMovimentacao.includes('Ajuste')) && (
              <div className="form-group">
                <label>Local de Destino *</label>
                <select
                  value={formData.local_destino_id}
                  onChange={(e) => setFormData({...formData, local_destino_id: e.target.value})}
                  required
                >
                  <option value="">Selecione...</option>
                  {locais.map(local => (
                    <option key={local.id} value={local.id}>{local.nome}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Quantidade *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Custo Unitário *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.custo_unitario}
                  onChange={(e) => setFormData({...formData, custo_unitario: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data *</label>
                <input
                  type="date"
                  value={formData.data_movimentacao}
                  onChange={(e) => setFormData({...formData, data_movimentacao: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-submit">
                Registrar
              </button>
            </div>
          </form>
        </div>
      ) : (
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
      )}

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
