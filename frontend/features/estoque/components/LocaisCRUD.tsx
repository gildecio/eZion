import { useState, useEffect } from 'react';
import { localService } from '../services/local-service';
import { DeleteConfirmModal } from '@/shared/components/DeleteConfirmModal';
import type { Local, LocalCreate, LocalUpdate } from '../types/local';

export default function LocaisCRUD() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLocal, setEditingLocal] = useState<Local | null>(null);
  const [deletingLocal, setDeletingLocal] = useState<Local | null>(null);
  const [formData, setFormData] = useState<LocalCreate>({
    codigo: '',
    nome: '',
    descricao: '',
    ativo: true,
  });

  useEffect(() => {
    loadLocais();
  }, []);

  const loadLocais = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await localService.getAll();
      setLocais(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar locais');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLocal(null);
    setFormData({ codigo: '', nome: '', descricao: '', ativo: true });
    setShowForm(true);
  };

  const handleEdit = (local: Local) => {
    setEditingLocal(local);
    setFormData({
      codigo: local.codigo,
      nome: local.nome,
      descricao: local.descricao || '',
      ativo: local.ativo,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (editingLocal) {
        await localService.update(editingLocal.id, formData);
      } else {
        await localService.create(formData);
      }
      
      await loadLocais();
      setShowForm(false);
      setEditingLocal(null);
      setFormData({ codigo: '', nome: '', descricao: '', ativo: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar local');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLocal) return;
    
    try {
      setLoading(true);
      setError(null);
      await localService.delete(deletingLocal.id);
      await loadLocais();
      setDeletingLocal(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir local');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="locais-crud">
      <div className="header">
        <div>
          <h1>Locais de Armazenamento</h1>
          <p>Gerencie os locais onde os itens do estoque são armazenados</p>
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
            <h2>{editingLocal ? 'Editar Local' : 'Novo Local'}</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingLocal(null);
              }}
              className="btn-close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="codigo">Código *</label>
                <input
                  id="codigo"
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  maxLength={20}
                  required
                  placeholder="Ex: DEP01, ARM01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nome">Nome *</label>
                <input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  maxLength={100}
                  required
                  placeholder="Ex: Depósito Principal"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                maxLength={255}
                rows={3}
                placeholder="Descrição detalhada do local"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
                <span>Ativo</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingLocal(null);
                }}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {editingLocal ? 'Atualizar' : 'Cadastrar'}
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
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {locais.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty">
                        Nenhum local cadastrado
                      </td>
                    </tr>
                  ) : (
                    locais.map((local) => (
                      <tr key={local.id}>
                        <td>
                          <span className="badge-codigo">{local.codigo}</span>
                        </td>
                        <td>{local.nome}</td>
                        <td>{local.descricao || '-'}</td>
                        <td>
                          <span className={`badge-status ${local.ativo ? 'active' : 'inactive'}`}>
                            {local.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="actions">
                          <button
                            onClick={() => handleEdit(local)}
                            className="btn-edit"
                            title="Editar"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingLocal(local)}
                            className="btn-delete"
                            title="Excluir"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {deletingLocal && (
        <DeleteConfirmModal
          itemName={deletingLocal.nome}
          onConfirm={handleDelete}
          onCancel={() => setDeletingLocal(null)}
        />
      )}

      <style jsx>{`
        .locais-crud {
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

        .badge-codigo {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badge-status {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .badge-status.active {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-status.inactive {
          background: #fee2e2;
          color: #991b1b;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1rem;
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
        textarea {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
          cursor: pointer;
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

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .locais-crud {
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

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
