import { useState } from 'react';
import type { GrupoItem, CreateGrupoItemDTO, UpdateGrupoItemDTO } from '../types/grupo-item';

interface GrupoItemFormProps {
  grupos: GrupoItem[];
  initialData?: GrupoItem | null;
  onSubmit: (data: CreateGrupoItemDTO | UpdateGrupoItemDTO) => Promise<void>;
  onCancel: () => void;
}

export const GrupoItemForm = ({ grupos, initialData, onSubmit, onCancel }: GrupoItemFormProps) => {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [parentId, setParentId] = useState<number | null>(initialData?.parent_id || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      nome,
      parent_id: parentId
    };

    await onSubmit(data);
  };

  return (
    <div className="form-container">
      <h2 className="form-title">{initialData ? 'Editar Grupo' : 'Novo Grupo'}</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="nome">Nome do Grupo:</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Digite o nome do grupo"
          />
        </div>

        <div className="form-group">
          <label htmlFor="parent_id">Grupo Pai:</label>
          <select
            id="parent_id"
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Nenhum (Raiz)</option>
            {grupos.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {'  '.repeat(grupo.level)}{grupo.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" className="btn-submit">
            {initialData ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .form-container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #1f2937;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
        }

        .form-group input,
        .form-group select {
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .btn-cancel,
        .btn-submit {
          padding: 0.625rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-submit {
          background: #3b82f6;
          color: white;
        }

        .btn-submit:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};
