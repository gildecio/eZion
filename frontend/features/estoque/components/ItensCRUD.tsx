import React, { useState, useEffect } from 'react';
import { useItens } from '../hooks';
import ItemForm from './ItemForm';
import ItemTable from './ItemTable';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { Item, CreateItemDTO, UpdateItemDTO, TipoItem } from '../types';
import { grupoItemService } from '../../../src/features/estoque/services/grupo-item.service';
import type { GrupoItem } from '../../../src/features/estoque/types/grupo-item';

export default function ItensCRUD() {
  const [filtroGrupo, setFiltroGrupo] = useState<number | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<TipoItem | null>(null);
  const [filtrosAplicados, setFiltrosAplicados] = useState<{
    grupo_id: number | null;
    tipo: TipoItem | null;
  } | undefined>(undefined);
  
  const { itens, loading, error, create, update, remove } = useItens(filtrosAplicados);
  
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | undefined>(undefined);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grupos, setGrupos] = useState<GrupoItem[]>([]);

  useEffect(() => {
    const loadGrupos = async () => {
      try {
        const gruposData = await grupoItemService.getAll();
        setGrupos(gruposData);
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
      }
    };

    loadGrupos();
  }, []);

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

  const handleConsultar = () => {
    setFiltrosAplicados({
      grupo_id: filtroGrupo,
      tipo: filtroTipo
    });
  };

  const handleLimparFiltros = () => {
    setFiltroGrupo(null);
    setFiltroTipo(null);
    setFiltrosAplicados(undefined);
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

      {!showForm && (
        <div className="filters">
          <div className="filter-group">
            <label>Filtrar por Grupo:</label>
            <select
              value={filtroGrupo || ''}
              onChange={(e) => setFiltroGrupo(e.target.value ? Number(e.target.value) : null)}
              className="filter-select"
            >
              <option value="">Todos os grupos</option>
              <option value="0">Sem grupo</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Filtrar por Tipo:</label>
            <select
              value={filtroTipo || ''}
              onChange={(e) => setFiltroTipo(e.target.value as TipoItem || null)}
              className="filter-select"
            >
              <option value="">Todos os tipos</option>
              <option value="Produto">Produto</option>
              <option value="Produto em Criação">Produto em Criação</option>
              <option value="Insumo">Insumo</option>
              <option value="Imobilizado">Imobilizado</option>
              <option value="Servico">Serviço</option>
              <option value="Embalagem">Embalagem</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <button
            onClick={handleConsultar}
            className="btn-consultar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Consultar
          </button>

          {(filtrosAplicados !== undefined) && (
            <>
              <button
                onClick={handleLimparFiltros}
                className="btn-clear-filters"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar filtros
              </button>

              <div className="filter-results">
                {itens.length} {itens.length === 1 ? 'item encontrado' : 'itens encontrados'}
              </div>
            </>
          )}
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

        .filters {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 200px;
        }

        .filter-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .filter-select {
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s;
        }

        .filter-select:hover {
          border-color: #9ca3af;
        }

        .filter-select:focus {
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
        }

        .btn-consultar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: #556b2f;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          height: fit-content;
        }

        .btn-consultar:hover {
          background: #6b8e23;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(85, 107, 47, 0.2);
        }

        .btn-clear-filters {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          height: fit-content;
        }

        .btn-clear-filters:hover {
          background: #f9fafb;
          border-color: #9ca3af;
          color: #374151;
        }

        .filter-results {
          display: flex;
          align-items: center;
          padding: 0.625rem 1rem;
          background: #556b2f;
          color: white;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          height: fit-content;
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
