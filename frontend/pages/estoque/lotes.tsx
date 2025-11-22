import { useState, useEffect } from 'react';
import { loteService } from '@/features/estoque/services/lote.service';
import { DeleteConfirmModal } from '@/shared/components/DeleteConfirmModal';
import type { Lote, CreateLoteDTO, UpdateLoteDTO } from '@/features/estoque/types';

export default function LotesPage() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLote, setEditingLote] = useState<Lote | null>(null);
  const [deletingLote, setDeletingLote] = useState<Lote | null>(null);
  const [formData, setFormData] = useState<CreateLoteDTO>({
    codigo: '',
    data_validade: '',
  });

  useEffect(() => {
    loadLotes();
  }, []);

  const loadLotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loteService.getAll();
      setLotes(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar lotes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLote(null);
    setFormData({ codigo: '', data_validade: '' });
    setShowForm(true);
  };

  const handleEdit = (lote: Lote) => {
    setEditingLote(lote);
    setFormData({
      codigo: lote.codigo,
      data_validade: lote.data_validade || '',
      data_fabricacao: lote.data_fabricacao,
      observacoes: lote.observacoes,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Limpar campos vazios antes de enviar
      const cleanData = {
        codigo: formData.codigo,
        ...(formData.data_fabricacao && { data_fabricacao: formData.data_fabricacao }),
        ...(formData.data_validade && { data_validade: formData.data_validade }),
        ...(formData.observacoes && { observacoes: formData.observacoes }),
      };
      
      if (editingLote) {
        await loteService.update(editingLote.id, cleanData as UpdateLoteDTO);
      } else {
        await loteService.create(cleanData as CreateLoteDTO);
      }
      
      await loadLotes();
      setShowForm(false);
      setEditingLote(null);
      setFormData({ codigo: '', data_validade: '' });
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar lote');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLote) return;
    
    try {
      setLoading(true);
      setError(null);
      await loteService.delete(deletingLote.id);
      await loadLotes();
      setDeletingLote(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir lote');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="lotes-crud">
      <div className="header">
        <div>
          <h1>Lotes</h1>
          <p>Gerencie os lotes do estoque</p>
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
            <h2>{editingLote ? 'Editar Lote' : 'Novo Lote'}</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingLote(null);
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
                <label htmlFor="codigo">Código do Lote *</label>
                <input
                  id="codigo"
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  maxLength={50}
                  required
                  placeholder="Ex: L001, LOTE-2024-001"
                />
              </div>

              <div className="form-group">
                <label htmlFor="data_fabricacao">Data de Fabricação</label>
                <input
                  id="data_fabricacao"
                  type="date"
                  value={formData.data_fabricacao || ''}
                  onChange={(e) => setFormData({ ...formData, data_fabricacao: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="data_validade">Data de Validade</label>
                <input
                  id="data_validade"
                  type="date"
                  value={formData.data_validade || ''}
                  onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="observacoes">Observações</label>
                <input
                  id="observacoes"
                  type="text"
                  value={formData.observacoes || ''}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  maxLength={255}
                  placeholder="Informações adicionais sobre o lote"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingLote(null);
                }}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {editingLote ? 'Atualizar' : 'Cadastrar'}
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
                    <th>Data de Fabricação</th>
                    <th>Data de Validade</th>
                    <th>Observações</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty">
                        Nenhum lote cadastrado
                      </td>
                    </tr>
                  ) : (
                    lotes.map((lote) => (
                      <tr key={lote.id}>
                        <td>
                          <span className="badge-codigo">{lote.codigo}</span>
                        </td>
                        <td>{formatDate(lote.data_fabricacao)}</td>
                        <td>{formatDate(lote.data_validade)}</td>
                        <td>{lote.observacoes || '-'}</td>
                        <td className="actions">
                          <button
                            onClick={() => handleEdit(lote)}
                            className="btn-edit"
                            title="Editar"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingLote(lote)}
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

      {deletingLote && (
        <DeleteConfirmModal
          itemName={deletingLote.codigo}
          onConfirm={handleDelete}
          onCancel={() => setDeletingLote(null)}
        />
      )}

      <style jsx>{`
        .lotes-crud {
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
          grid-template-columns: 1fr 1fr;
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

        input {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
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
          .lotes-crud {
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
