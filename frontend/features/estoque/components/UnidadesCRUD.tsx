import { useState } from 'react';
import { useUnidades } from '../hooks';
import { DeleteConfirmModal } from '@/shared/components';
import type { Unidade, CreateUnidadeDTO, UpdateUnidadeDTO, TipoMedida } from '../types';

export default function UnidadesCRUD() {
  const { unidades, loading, error, create, update, remove } = useUnidades();
  const [showForm, setShowForm] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
  const [deletingUnidade, setDeletingUnidade] = useState<Unidade | null>(null);
  const [formData, setFormData] = useState<CreateUnidadeDTO>({
    sigla: '',
    descricao: '',
    tipo_medida: 'Quantidade' as TipoMedida
  });

  const handleCreate = () => {
    setEditingUnidade(null);
    setFormData({ sigla: '', descricao: '', tipo_medida: 'Quantidade' as TipoMedida });
    setShowForm(true);
  };

  const handleEdit = (unidade: Unidade) => {
    setEditingUnidade(unidade);
    setFormData({ sigla: unidade.sigla, descricao: unidade.descricao, tipo_medida: unidade.tipo_medida });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = editingUnidade
      ? await update(editingUnidade.id, formData)
      : await create(formData);

    if (success) {
      setShowForm(false);
      setEditingUnidade(null);
      setFormData({ sigla: '', descricao: '', tipo_medida: 'Quantidade' as TipoMedida });
    }
  };

  const handleDelete = async () => {
    if (!deletingUnidade) return;
    
    const success = await remove(deletingUnidade.id);
    if (success) {
      setDeletingUnidade(null);
    }
  };

  return (
    <div className="unidades-crud">
      <div className="header">
        <div>
          <h1>Unidades de Medida</h1>
          <p>Gerencie as unidades de medida do estoque</p>
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

      {showForm ? (
        <div className="form-container">
          <div className="form-header">
            <h2>{editingUnidade ? 'Editar Unidade' : 'Nova Unidade'}</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingUnidade(null);
              }}
              className="btn-close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="sigla">Sigla *</label>
              <input
                id="sigla"
                type="text"
                value={formData.sigla}
                onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                maxLength={10}
                required
                placeholder="Ex: KG, L, UN"
              />
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição *</label>
              <input
                id="descricao"
                type="text"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                maxLength={100}
                required
                placeholder="Ex: Quilograma, Litro, Unidade"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo_medida">Tipo de Medida *</label>
              <select
                id="tipo_medida"
                value={formData.tipo_medida}
                onChange={(e) => setFormData({ ...formData, tipo_medida: e.target.value as TipoMedida })}
                required
              >
                <option value="Quantidade">Quantidade</option>
                <option value="Peso">Peso</option>
                <option value="Volume">Volume</option>
                <option value="Comprimento">Comprimento</option>
                <option value="Area">Área</option>
                <option value="Outros">Outros</option>
              </select>
              <small>Define o tipo de grandeza física da unidade</small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUnidade(null);
                }}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-submit">
                {editingUnidade ? 'Atualizar' : 'Cadastrar'}
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
                    <th>ID</th>
                    <th>Sigla</th>
                    <th>Descrição</th>
                    <th>Tipo de Medida</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {unidades.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty">
                        Nenhuma unidade cadastrada
                      </td>
                    </tr>
                  ) : (
                    unidades.map((unidade) => (
                      <tr key={unidade.id}>
                        <td>{unidade.id}</td>
                        <td>
                          <span className="badge-sigla">{unidade.sigla}</span>
                        </td>
                        <td>{unidade.descricao}</td>
                        <td>
                          <span className="badge-tipo">{unidade.tipo_medida}</span>
                        </td>
                        <td className="actions">
                          <button
                            onClick={() => handleEdit(unidade)}
                            className="btn-edit"
                            title="Editar"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingUnidade(unidade)}
                            className="btn-delete"
                            title="Excluir"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="3 6 5 6 21 6" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {deletingUnidade && (
        <DeleteConfirmModal
          itemName={`${deletingUnidade.sigla} - ${deletingUnidade.descricao}`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingUnidade(null)}
        />
      )}

      <style jsx>{`
        .unidades-crud {
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
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #e5e7eb;
        }

        td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        .empty {
          text-align: center;
          color: #9ca3af;
          padding: 3rem;
        }

        .badge-sigla {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badge-tipo {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f3e8ff;
          color: #6b21a8;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit,
        .btn-delete {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
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

        .form-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

        form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }

        input,
        select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
        }

        small {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
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
          background: #6d8b3c;
        }

        @media (max-width: 768px) {
          .unidades-crud {
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
