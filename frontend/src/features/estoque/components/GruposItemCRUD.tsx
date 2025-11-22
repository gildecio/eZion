import { useState, useMemo } from 'react';
import { GrupoItemForm } from './GrupoItemForm';
import { GrupoItemTreeView } from './GrupoItemTreeView';
import { DeleteConfirmModal } from '@/shared/components';
import { useGruposItem } from '../hooks/useGruposItem';
import { useItens } from '@/features/estoque/hooks';
import type { GrupoItem, GrupoItemTree } from '../types/grupo-item';
import type { Item } from '@/features/estoque/types';

export const GruposItemCRUD = () => {
  const { grupos, tree, loading, error, create, update, remove } = useGruposItem();
  const [showForm, setShowForm] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoItem | null>(null);
  const [deletingGrupo, setDeletingGrupo] = useState<GrupoItemTree | null>(null);
  const [selectedGrupoId, setSelectedGrupoId] = useState<number | null>(null);
  
  const filtros = useMemo(() => 
    selectedGrupoId ? { grupo_id: selectedGrupoId } : undefined,
    [selectedGrupoId]
  );
  
  const { itens: itensDoGrupo, loading: loadingItens } = useItens(filtros);

  const handleCreate = () => {
    setEditingGrupo(null);
    setShowForm(true);
  };

  const handleEdit = (grupo: GrupoItemTree) => {
    setEditingGrupo(grupo as GrupoItem);
    setShowForm(true);
  };

  const handleGrupoClick = (grupo: GrupoItemTree) => {
    if (grupo.is_leaf) {
      setSelectedGrupoId(grupo.id);
    }
  };

  const handleSubmit = async (data: any) => {
    if (editingGrupo) {
      const success = await update(editingGrupo.id, data);
      if (success) {
        setShowForm(false);
        setEditingGrupo(null);
      }
    } else {
      const success = await create(data);
      if (success) {
        setShowForm(false);
      }
    }
  };

  const handleDelete = async () => {
    if (deletingGrupo) {
      const success = await remove(deletingGrupo.id);
      if (success) {
        setDeletingGrupo(null);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGrupo(null);
  };

  return (
    <div className="grupos-crud">
      <div className="header">
        <div>
          <h1 className="title">Grupos de Itens</h1>
          <p className="subtitle">Gerencie a hierarquia de grupos de estoque</p>
        </div>
        {!showForm && (
          <button onClick={handleCreate} className="btn-new">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Cadastrar
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm ? (
        <GrupoItemForm
          grupos={grupos}
          initialData={editingGrupo}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <div className="split-view">
          <div className="left-panel">
            <div className="panel-header">
              <h2>Grupos</h2>
            </div>
            <div className="panel-content">
              {loading ? (
                <div className="loading">Carregando...</div>
              ) : (
                <GrupoItemTreeView
                  nodes={tree}
                  onEdit={handleEdit}
                  onDelete={setDeletingGrupo}
                  onNodeClick={handleGrupoClick}
                  selectedId={selectedGrupoId}
                />
              )}
            </div>
          </div>

          <div className="right-panel">
            <div className="panel-header">
              <h2>Itens do Grupo</h2>
            </div>
            <div className="panel-content">
              {!selectedGrupoId ? (
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>Selecione um grupo folha para ver seus itens</p>
                </div>
              ) : loadingItens ? (
                <div className="loading">Carregando itens...</div>
              ) : itensDoGrupo.length === 0 ? (
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>Nenhum item neste grupo</p>
                </div>
              ) : (
                <div className="items-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Descrição</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensDoGrupo.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.descricao}</td>
                          <td>
                            <span className="badge">{item.tipo}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deletingGrupo && (
        <DeleteConfirmModal
          itemName={deletingGrupo.nome}
          onConfirm={handleDelete}
          onCancel={() => setDeletingGrupo(null)}
        />
      )}

      <style jsx>{`
        .grupos-crud {
          padding: 2rem;
          max-width: 90%;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .subtitle {
          color: #6b7280;
          margin: 0.5rem 0 0 0;
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
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .btn-new:hover {
          background: #6b8e23;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(85, 107, 47, 0.2);
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #fecaca;
        }

        .split-view {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          min-height: 600px;
        }

        .left-panel,
        .right-panel {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
          padding: 1rem 1.5rem;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }

        .panel-content {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: #9ca3af;
          text-align: center;
        }

        .empty-state svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.875rem;
        }

        .items-table {
          overflow-x: auto;
        }

        .items-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .items-table thead {
          background: #f9fafb;
          position: sticky;
          top: 0;
        }

        .items-table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #e5e7eb;
        }

        .items-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        }

        .items-table tbody tr:hover {
          background: #f9fafb;
        }

        .items-table .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #e0f2fe;
          color: #0369a1;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-wrapper {
          width: 100%;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        @media (max-width: 1024px) {
          .split-view {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .grupos-crud {
            padding: 1rem;
          }

          .header {
            flex-direction: column;
            gap: 1rem;
          }

          .btn-new {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
