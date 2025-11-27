import React, { useState, useEffect } from 'react';
import type { Item } from '../types';
import { grupoItemService } from '../../../src/features/estoque/services/grupo-item.service';
import type { GrupoItem } from '../../../src/features/estoque/types/grupo-item';

interface ItemTableProps {
  itens: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  isLoading?: boolean;
}

export default function ItemTable({ itens, onEdit, onDelete, isLoading }: ItemTableProps) {
  const [grupos, setGrupos] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const loadGrupos = async () => {
      try {
        const gruposData = await grupoItemService.getAll();
        const gruposMap = new Map(gruposData.map(g => [g.id, g.nome]));
        setGrupos(gruposMap);
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
      }
    };

    loadGrupos();
  }, []);
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando itens...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            color: #6b7280;
          }

          .spinner {
            width: 2rem;
            height: 2rem;
            border: 3px solid #e5e7eb;
            border-top-color: #556b2f;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3>Selecione os filtros e clique em Consultar</h3>
        <p>Use os filtros acima para buscar itens do estoque</p>
        <style jsx>{`
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            color: #6b7280;
          }

          .empty-state svg {
            color: #d1d5db;
            margin-bottom: 1rem;
          }

          .empty-state h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.125rem;
            font-weight: 600;
            color: #374151;
          }

          .empty-state p {
            margin: 0;
            font-size: 0.875rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="item-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Cód. Alternativo</th>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Grupo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.id}>
              <td>{item.codigo}</td>
              <td>{item.codigo_alternativo || '-'}</td>
              <td>{item.descricao}</td>
              <td>
                <span className={`tipo-badge tipo-${item.tipo.toLowerCase().replace(/\s+/g, '-')}`}>
                  {item.tipo}
                </span>
              </td>
              <td>
                {item.grupo_id ? (
                  <span className="grupo-badge">
                    {grupos.get(item.grupo_id) || `Grupo #${item.grupo_id}`}
                  </span>
                ) : (
                  <span className="sem-grupo">Sem grupo</span>
                )}
              </td>
              <td>
                <div className="actions">
                  <button
                    onClick={() => onEdit(item)}
                    className="btn-edit"
                    title="Editar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="btn-delete"
                    title="Excluir"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .table-container {
          overflow-x: auto;
        }

        .item-table {
          width: 100%;
          min-width: 800px;
          border-collapse: collapse;
        }

        .item-table thead tr {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .item-table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .item-table th:nth-child(1) {
          width: 150px;
        }

        .item-table th:nth-child(2) {
          width: auto;
          min-width: 300px;
        }

        .item-table th:nth-child(3) {
          width: 200px;
        }

        .item-table th:nth-child(4) {
          width: 120px;
          text-align: center;
        }

        .item-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
        }

        .item-table tbody tr:hover {
          background: #f9fafb;
        }

        .item-table tbody tr:last-child {
          border-bottom: none;
        }

        .item-table td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #1f2937;
        }

        .item-table td:nth-child(4) {
          text-align: center;
        }

        .tipo-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
        }

        .tipo-badge.tipo-produto {
          background: #10b981;
        }

        .tipo-badge.tipo-produto-em-criação {
          background: #f59e0b;
        }

        .tipo-badge.tipo-insumo {
          background: #3b82f6;
        }

        .tipo-badge.tipo-imobilizado {
          background: #8b5cf6;
        }

        .tipo-badge.tipo-servico {
          background: #ec4899;
        }

        .tipo-badge.tipo-embalagem {
          background: #14b8a6;
        }

        .tipo-badge.tipo-outros {
          background: #6b7280;
        }

        .grupo-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          background: #556b2f;
          color: white;
        }

        .sem-grupo {
          font-size: 0.75rem;
          color: #9ca3af;
          font-style: italic;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit,
        .btn-delete {
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-edit {
          background: #dbeafe;
          color: #1e40af;
        }

        .btn-edit:hover {
          background: #bfdbfe;
        }

        .btn-delete {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-delete:hover {
          background: #fecaca;
        }
      `}</style>
    </div>
  );
}
