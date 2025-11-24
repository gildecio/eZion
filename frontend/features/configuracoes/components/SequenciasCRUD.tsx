import React, { useState, useEffect } from 'react';
import { sequenciaService } from '../services/sequencia.service';
import { Sequencia, CreateSequenciaDTO, UpdateSequenciaDTO, TipoSequencia } from '../types';
import { DeleteConfirmModal } from '@/shared/components/DeleteConfirmModal';

interface SequenciasCRUDProps {
  empresaId: number;
}

const SequenciasCRUD: React.FC<SequenciasCRUDProps> = ({ empresaId }) => {
  const [sequencias, setSequencias] = useState<Sequencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [documentoTipo, setDocumentoTipo] = useState('');
  const [numero, setNumero] = useState(1);
  const [serie, setSerie] = useState('');
  const [numeroMaximo, setNumeroMaximo] = useState(999999);
  const [tipo, setTipo] = useState<TipoSequencia>('CONTINUO');

  useEffect(() => {
    loadData();
  }, [empresaId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await sequenciaService.getAll({ empresa_id: empresaId });
      setSequencias(data);
    } catch (error) {
      console.error('Erro ao carregar sequências:', error);
      alert('Erro ao carregar sequências');
    } finally {
      setLoading(false);
    }
  };

  const openForm = (sequencia?: Sequencia) => {
    if (sequencia) {
      setEditingId(sequencia.id);
      setDocumentoTipo(sequencia.documento_tipo);
      setNumero(sequencia.numero);
      setSerie(sequencia.serie || '');
      setNumeroMaximo(sequencia.numero_maximo);
      setTipo(sequencia.tipo);
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setDocumentoTipo('');
    setNumero(1);
    setSerie('');
    setNumeroMaximo(999999);
    setTipo('CONTINUO');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentoTipo.trim()) {
      alert('Preencha o tipo de documento');
      return;
    }

    setLoading(true);
    try {
      const data: CreateSequenciaDTO = {
        documento_tipo: documentoTipo,
        numero,
        serie: serie.trim() || undefined,
        numero_maximo: numeroMaximo,
        tipo,
        empresa_id: empresaId
      };

      if (editingId) {
        await sequenciaService.update(editingId, data as UpdateSequenciaDTO);
      } else {
        await sequenciaService.create(data);
      }

      await loadData();
      setIsFormOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar sequência:', error);
      alert(error.response?.data?.detail || 'Erro ao salvar sequência');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setLoading(true);
    try {
      await sequenciaService.delete(deletingId);
      await loadData();
      setDeleteModalOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Erro ao excluir sequência:', error);
      alert('Erro ao excluir sequência');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  return (
    <div className="sequencias-crud">
      <div className="header">
        <div>
          <h1>Sequências de Documentos</h1>
          <p>Gerencie as sequências numéricas para documentos da empresa</p>
        </div>
        {!isFormOpen && (
          <button onClick={() => openForm()} className="btn-new">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nova Sequência
          </button>
        )}
      </div>

      <div className="content">
        {isFormOpen ? (
          <div className="form-container">
            <div className="form-header">
              <h2>{editingId ? 'Editar' : 'Nova'} Sequência</h2>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="btn-close"
                title="Fechar"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipo de Documento <span className="required">*</span></label>
                <input
                  type="text"
                  value={documentoTipo}
                  onChange={(e) => setDocumentoTipo(e.target.value)}
                  placeholder="Ex: ESTOQUE_AJUSTE, NFE_SAIDA"
                  required
                  maxLength={50}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo <span className="required">*</span></label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoSequencia)}
                    required
                  >
                    <option value="CONTINUO">Contínuo</option>
                    <option value="ANUAL">Anual</option>
                  </select>
                  <small className="help-text">
                    {tipo === 'ANUAL' 
                      ? 'Reseta número para 1 e atualiza série para o ano atual a cada novo ano'
                      : 'Incrementa série em 1 quando atingir o número máximo'}
                  </small>
                </div>

                <div className="form-group">
                  <label>
                    Série {tipo === 'ANUAL' && <span className="help-inline">(será atualizado automaticamente para o ano)</span>}
                  </label>
                  <input
                    type="text"
                    value={serie}
                    onChange={(e) => setSerie(e.target.value)}
                    placeholder={tipo === 'ANUAL' ? 'Ex: 2025' : 'Ex: 1, A, 001'}
                    maxLength={10}
                  />
                  {tipo === 'ANUAL' && serie && !/^\d{4}$/.test(serie) && (
                    <small className="warning-text">⚠️ Para tipo ANUAL, recomenda-se usar formato de ano (4 dígitos)</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Número Atual <span className="required">*</span></label>
                  <input
                    type="number"
                    value={numero}
                    onChange={(e) => setNumero(Number(e.target.value))}
                    min={0}
                    required
                  />
                  <small className="help-text">Use 0 para iniciar do número 1</small>
                </div>

                <div className="form-group">
                  <label>Número Máximo <span className="required">*</span></label>
                  <input
                    type="number"
                    value={numeroMaximo}
                    onChange={(e) => setNumeroMaximo(Number(e.target.value))}
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tipo de Documento</th>
                  <th>Série</th>
                  <th>Número Atual</th>
                  <th>Número Máximo</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sequencias.map((sequencia) => (
                  <tr key={sequencia.id}>
                    <td>{sequencia.documento_tipo}</td>
                    <td>{sequencia.serie || '-'}</td>
                    <td>{sequencia.numero}</td>
                    <td>{sequencia.numero_maximo}</td>
                    <td>
                      <span className={`badge badge-${sequencia.tipo.toLowerCase()}`}>
                        {sequencia.tipo === 'ANUAL' ? 'Anual' : 'Contínuo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          onClick={() => openForm(sequencia)}
                          className="btn-edit"
                          title="Editar sequência"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.33301 14.6667L2.66634 10.6667L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(sequencia.id)}
                          className="btn-delete"
                          title="Excluir sequência"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sequencias.length === 0 && (
              <div className="empty-state">
                Nenhuma sequência cadastrada
              </div>
            )}
          </div>
        )}
      </div>

      {deleteModalOpen && (
        <DeleteConfirmModal
          onCancel={() => {
            setDeleteModalOpen(false);
            setDeletingId(null);
          }}
          onConfirm={handleDelete}
          itemName={sequencias.find(s => s.id === deletingId)?.documento_tipo || ''}
        />
      )}

      <style jsx>{`
        .sequencias-crud {
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
          margin: 0 0 0.25rem 0;
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
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-new:hover {
          background: #6d8b3c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(85, 107, 47, 0.2);
        }

        .content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
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
          text-align: left;
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e5e7eb;
        }

        tbody tr {
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.2s;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        tbody tr:last-child {
          border-bottom: none;
        }

        td {
          padding: 1rem;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 3rem 1rem;
          font-size: 0.875rem;
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
          color: #991b1b;
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

        form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          font-size: 0.95rem;
        }

        .required {
          color: #dc2626;
        }

        .help-text {
          font-size: 0.75rem;
          color: #6b7280;
          font-style: italic;
          margin-top: -0.25rem;
        }

        .help-inline {
          font-size: 0.7rem;
          color: #6b7280;
          font-weight: 400;
          font-style: italic;
        }

        .warning-text {
          font-size: 0.75rem;
          color: #f59e0b;
          margin-top: 0.25rem;
          display: block;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-anual {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge-continuo {
          background: #d1fae5;
          color: #065f46;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-cancel {
          padding: 0.625rem 1.25rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-submit {
          padding: 0.625rem 1.25rem;
          background: #556b2f;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-submit:hover {
          background: #465a26;
        }

        .btn-submit:disabled,
        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .sequencias-crud {
            padding: 1rem;
            max-width: 100%;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header h1 {
            font-size: 1.5rem;
          }

          .btn-new {
            width: 100%;
            justify-content: center;
          }

          .form-container {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }

          .table-wrapper {
            overflow-x: scroll;
          }

          table {
            min-width: 600px;
          }
        }
      `}</style>
    </div>
  );
};

export default SequenciasCRUD;
