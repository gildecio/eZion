import React, { useState } from 'react';
import { useItens } from '../hooks';
import ItemForm from './ItemForm';
import ItemTable from './ItemTable';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { Item, CreateItemDTO, UpdateItemDTO } from '../types';

export default function ItensCRUD() {
  const { itens, loading, error, create, update, remove } = useItens();
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | undefined>(undefined);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = () => {
    setSelectedItem(undefined);
    setShowForm(true);
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleDelete = (item: Item) => {
    setItemToDelete(item);
  };

  const handleSubmit = async (data: CreateItemDTO | UpdateItemDTO) => {
    setIsSubmitting(true);
    try {
      if (selectedItem) {
        await update(selectedItem.id, data as UpdateItemDTO);
      } else {
        await create(data as CreateItemDTO);
      }
      setShowForm(false);
      setSelectedItem(undefined);
    } catch (error) {
      console.error('Erro ao salvar item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsSubmitting(true);
    try {
      await remove(itemToDelete.id);
      setItemToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="itens-crud">
      <div className="header">
        <div>
          <h1>Itens</h1>
          <p>Gerencie os itens do estoque</p>
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
              <h2>{selectedItem ? 'Editar Item' : 'Novo Item'}</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedItem(undefined);
                }}
                className="btn-close"
                title="Fechar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ItemForm
              item={selectedItem}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setSelectedItem(undefined);
              }}
              isLoading={isSubmitting}
            />
          </div>
        ) : (
          <ItemTable
            itens={itens}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={loading}
          />
        )}
      </div>

      {itemToDelete && (
        <DeleteConfirmModal
          item={itemToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
          isLoading={isSubmitting}
        />
      )}

      <style jsx>{`
        .itens-crud {
          padding: 2rem;
          max-width: 90%;
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
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-new:hover {
          background: #6d8b3c;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #991b1b;
          margin-bottom: 1.5rem;
        }

        .error-alert svg {
          flex-shrink: 0;
        }

        .error-alert span {
          font-size: 0.875rem;
        }

        .content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .form-container {
          padding: 2rem;
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
          .itens-crud {
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
        }
      `}</style>
    </div>
  );
}
