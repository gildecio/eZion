'use client';

import React, { useState, useEffect } from 'react';
import { useRequisicoes } from '../hooks/useRequisicoes';
import { useItens } from '../hooks/useItens';
import { useLocais } from '../hooks/useLocais';
import type { Requisicao, CreateRequisicaoDTO, UpdateRequisicaoDTO, StatusRequisicao } from '../types/requisicao';
import RequisicaoForm from './RequisicaoForm';
import { DeleteConfirmModal } from '@/shared/components/DeleteConfirmModal';
import { formatDate } from '@/utils/formatters';

export default function RequisicoesCRUD() {
  const { requisicoes, loading, error, create, update, remove, refresh } = useRequisicoes();
  const { itens } = useItens();
  const { locais } = useLocais();
  const [showForm, setShowForm] = useState(false);
  const [selectedRequisicao, setSelectedRequisicao] = useState<Requisicao | undefined>(undefined);
  const [requisicaoToDelete, setRequisicaoToDelete] = useState<Requisicao | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Estados para filtros
  const [filters, setFilters] = useState({
    dataInicio: '',
    dataFim: '',
    localId: '',
    status: '' as StatusRequisicao | '',
  });
  const [hasSearched, setHasSearched] = useState(false);

  // Debug logs
  console.log('RequisicoesCRUD render:', { requisicoes, loading, error, itens: itens.length });

  const handleCreate = () => {
    setSelectedRequisicao(undefined);
    setShowForm(true);
  };

  const handleEdit = (req: Requisicao) => {
    setSelectedRequisicao(req);
    setShowForm(true);
  };

  const handleDelete = (req: Requisicao) => {
    setRequisicaoToDelete(req);
  };

  const toggleExpandRow = (requisicaoId: number) => {
    setExpandedRow(expandedRow === requisicaoId ? null : requisicaoId);
  };

  const handleSubmit = async (data: CreateRequisicaoDTO | UpdateRequisicaoDTO) => {
    setIsSubmitting(true);
    try {
      if (selectedRequisicao) {
        await update(selectedRequisicao.id, data as UpdateRequisicaoDTO);
      } else {
        await create(data as CreateRequisicaoDTO);
      }
      setShowForm(false);
      setSelectedRequisicao(undefined);
      refresh();
    } catch (error) {
      // TODO: feedback de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!requisicaoToDelete) return;
    setIsSubmitting(true);
    try {
      await remove(requisicaoToDelete.id);
      setRequisicaoToDelete(null);
      refresh();
    } catch (error) {
      // TODO: feedback de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConsultar = () => {
    setHasSearched(true);
    const filterParams = {
      data_inicio: filters.dataInicio || undefined,
      data_fim: filters.dataFim || undefined,
      local_id: filters.localId ? Number(filters.localId) : undefined,
      status: filters.status || undefined,
    };
    refresh(filterParams);
  };

  const getItemInfo = (itemId: number) => {
    console.log('getItemInfo called with itemId:', itemId, 'itens length:', itens.length);
    const item = itens.find(i => i.id === itemId);
    console.log('Found item:', item);
    return {
      codigo: item?.codigo || '-',
      descricao: item?.descricao || '-'
    };
  };

  return (
    <div className="requisicoes-crud">
      <div className="header">
        <div>
          <h1>Requisições de Estoque</h1>
          <p>Gerencie as requisições do estoque</p>
        </div>
        {!showForm && (
          <button onClick={handleCreate} className="btn-new">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Cadastrar
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

      <div className="content">
        {showForm ? (
          <div className="form-container">
            <div className="form-header">
              <h2>{selectedRequisicao ? 'Editar Requisição' : 'Nova Requisição'}</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedRequisicao(undefined);
                }}
                className="btn-close"
                title="Fechar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <RequisicaoForm
              requisicao={selectedRequisicao}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setSelectedRequisicao(undefined);
              }}
              isLoading={isSubmitting}
            />
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="filtros-section">
              <h3>Filtros</h3>
              <div className="filtros-grid">
                <div className="form-group">
                  <label>Data Início</label>
                  <input
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Data Fim</label>
                  <input
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Local</label>
                  <select
                    value={filters.localId}
                    onChange={(e) => handleFilterChange('localId', e.target.value)}
                  >
                    <option value="">Todos os locais</option>
                    {locais.map((local) => (
                      <option key={local.id} value={local.id}>
                        {local.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">Todos os status</option>
                    <option value="ABERTA">Aberta</option>
                    <option value="ATENDIDA">Atendida</option>
                    <option value="PARCIAL">Parcial</option>
                    <option value="CANCELADA">Cancelada</option>
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
                <div className="empty">Configure os filtros desejados e clique em "Consultar" para carregar as requisições.</div>
              ) : loading ? (
                <div className="loading">Carregando...</div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Número/Série</th>
                        <th>Solicitante</th>
                        <th>Status</th>
                        <th>Data</th>
                        <th>Itens</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requisicoes.length === 0 ? (
                        <tr><td colSpan={6} className="empty">Nenhuma requisição encontrada</td></tr>
                      ) : (
                        requisicoes.map(req => (
                          <React.Fragment key={req.id}>
                            <tr
                              className={expandedRow === req.id ? 'expanded' : ''}
                              style={{ cursor: 'pointer' }}
                            >
                              <td onClick={() => toggleExpandRow(req.id)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    stroke="currentColor"
                                    style={{
                                      transform: expandedRow === req.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.2s'
                                    }}
                                  >
                                    <path d="M4 2L8 6L4 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  {req.numero}{req.serie ? `/${req.serie}` : ''}
                                </div>
                              </td>
                              <td onClick={() => toggleExpandRow(req.id)}>{req.solicitante}</td>
                              <td onClick={() => toggleExpandRow(req.id)}>
                                <span className={`badge badge-${req.status === 'ABERTA' ? 'warning' : req.status === 'ATENDIDA' ? 'success' : req.status === 'PARCIAL' ? 'info' : 'danger'}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td onClick={() => toggleExpandRow(req.id)}>{formatDate(req.data_requisicao)}</td>
                              <td onClick={() => toggleExpandRow(req.id)}>{req.itens.length}</td>
                              <td>
                                <div className="actions">
                                  <button
                                    onClick={() => handleEdit(req)}
                                    className="btn-edit"
                                    title="Editar requisição"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                      <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.33301 14.6667L2.66634 10.6667L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(req)}
                                    className="btn-delete"
                                    title="Excluir requisição"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                      <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expandedRow === req.id && req.itens && req.itens.length > 0 && (
                              <tr className="expanded-row">
                                <td colSpan={6}>
                                  <div className="items-detail">
                                    <h4>Itens da Requisição</h4>
                                    <table className="items-table">
                                      <thead>
                                        <tr>
                                          <th>Código</th>
                                          <th>Item</th>
                                          <th>Quantidade</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {req.itens.map((item) => {
                                          const itemInfo = getItemInfo(item.item_id);
                                          return (
                                            <tr key={item.id}>
                                              <td>{itemInfo.codigo}</td>
                                              <td>{itemInfo.descricao}</td>
                                              <td>{item.quantidade}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {requisicaoToDelete && (
        <DeleteConfirmModal
          itemName={requisicaoToDelete.solicitante}
          onConfirm={handleConfirmDelete}
          onCancel={() => setRequisicaoToDelete(null)}
        />
      )}

      <style jsx>{`
        .requisicoes-crud {
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

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-warning {
          background: #fef3c7;
          color: #d97706;
        }

        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-info {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge-danger {
          background: #fee2e2;
          color: #dc2626;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .btn-edit {
          padding: 0.5rem;
          background: #dbeafe;
          color: #1e40af;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-edit:hover {
          background: #bfdbfe;
        }

        .btn-delete {
          padding: 0.5rem;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-delete:hover {
          background: #fecaca;
        }

        .expanded-row {
          background: #fafbfc;
        }

        .expanded-row td {
          padding: 0;
        }

        .items-detail {
          padding: 1.5rem;
          background: #f9fafb;
          border-top: 2px solid #e5e7eb;
        }

        .items-detail h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .items-table table {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .items-table thead {
          background: #f3f4f6;
        }

        .items-table th {
          padding: 0.75rem;
          font-size: 0.813rem;
        }

        .items-table td {
          padding: 0.75rem;
          font-size: 0.813rem;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }

        .btn-close {
          padding: 0.5rem;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .btn-close:hover {
          background: #e5e7eb;
          color: #374151;
        }

        @media (max-width: 768px) {
          .requisicoes-crud {
            padding: 1rem;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .btn-new {
            width: 100%;
            justify-content: center;
          }

          .form-container {
            padding: 1rem;
          }

          .filtros-section {
            padding: 1rem;
          }

          .filtros-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
