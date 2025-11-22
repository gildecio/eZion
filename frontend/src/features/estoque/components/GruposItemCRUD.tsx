import { useState } from 'react';
import { GrupoItemForm } from './GrupoItemForm';
import { GrupoItemTreeView } from './GrupoItemTreeView';
import { DeleteConfirmModal } from '@/shared/components/DeleteConfirmModal';
import { useGruposItem } from '../hooks/useGruposItem';
import type { GrupoItem, GrupoItemTree } from '../types/grupo-item';

export const GruposItemCRUD = () => {
  const { grupos, tree, loading, error, create, update, remove } = useGruposItem();
  const [showForm, setShowForm] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoItem | null>(null);
  const [deletingGrupo, setDeletingGrupo] = useState<GrupoItemTree | null>(null);

  const handleCreate = () => {
    setEditingGrupo(null);
    setShowForm(true);
  };

  const handleEdit = (grupo: GrupoItemTree) => {
    setEditingGrupo(grupo as GrupoItem);
    setShowForm(true);
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
        <div className="content">
          <div className="table-wrapper">
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : (
              <GrupoItemTreeView
                nodes={tree}
                onEdit={handleEdit}
                onDelete={setDeletingGrupo}
              />
            )}
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
      `}</style>
    </div>
  );
};
