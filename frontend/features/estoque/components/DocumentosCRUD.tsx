import React, { useState, useEffect } from 'react';
import { documentoService } from '../services/documentoService';
import { empresaService } from '@/features/contabil/services/empresa.service';
import { localService } from '../services/local-service';
import { 
  Documento, 
  CreateDocumentoDTO, 
  TipoDocumento, 
  TIPO_DOCUMENTO_LABELS,
  CAMPOS_POR_TIPO,
  CampoConfig 
} from '../types/documento';
import { Empresa } from '@/features/contabil/types/empresa';
import { Local } from '../types/local';
import { DeleteConfirmModal } from '@/shared/components/DeleteConfirmModal';

const DocumentosCRUD: React.FC = () => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [formData, setFormData] = useState<Partial<CreateDocumentoDTO>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadDocumentos();
    loadEmpresas();
    loadLocais();
  }, []);

  const loadDocumentos = async () => {
    try {
      const data = await documentoService.getAll();
      setDocumentos(data);
    } catch (err: any) {
      setError('Erro ao carregar documentos: ' + err.message);
    }
  };

  const loadEmpresas = async () => {
    try {
      const data = await empresaService.getAll();
      setEmpresas(data);
    } catch (err: any) {
      setError('Erro ao carregar empresas: ' + err.message);
    }
  };

  const loadLocais = async () => {
    try {
      const data = await localService.getAll();
      setLocais(data);
    } catch (err: any) {
      setError('Erro ao carregar locais: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editId) {
        await documentoService.update(editId, formData as CreateDocumentoDTO);
      } else {
        await documentoService.create(formData as CreateDocumentoDTO);
      }
      resetForm();
      loadDocumentos();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar documento');
    }
  };

  const handleEdit = (documento: Documento) => {
    setEditId(documento.id);
    setFormData(documento);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await documentoService.delete(deleteId);
      loadDocumentos();
      setDeleteId(null);
    } catch (err: any) {
      setError('Erro ao excluir documento: ' + err.message);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditId(null);
    setShowForm(false);
  };

  const getCamposPorTipo = (): CampoConfig[] => {
    if (!formData.tipo_documento) return [];
    return CAMPOS_POR_TIPO[formData.tipo_documento] || [];
  };

  const renderCampo = (config: CampoConfig) => {
    const { name, label, type, required, options } = config;
    
    if (type === 'select') {
      return (
        <div className="form-group" key={name}>
          <label>{label} {required && <span className="required">*</span>}</label>
          <select
            value={(formData as any)[name] || ''}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            required={required}
          >
            <option value="">Selecione...</option>
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (type === 'date') {
      return (
        <div className="form-group" key={name}>
          <label>{label} {required && <span className="required">*</span>}</label>
          <input
            type="date"
            value={(formData as any)[name] || ''}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            required={required}
          />
        </div>
      );
    }

    if (type === 'number') {
      return (
        <div className="form-group" key={name}>
          <label>{label} {required && <span className="required">*</span>}</label>
          <input
            type="number"
            step="0.01"
            value={(formData as any)[name] || ''}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            required={required}
          />
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="form-group" key={name}>
          <label>{label} {required && <span className="required">*</span>}</label>
          <textarea
            value={(formData as any)[name] || ''}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            required={required}
            rows={3}
          />
        </div>
      );
    }

    return (
      <div className="form-group" key={name}>
        <label>{label} {required && <span className="required">*</span>}</label>
        <input
          type="text"
          value={(formData as any)[name] || ''}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          required={required}
        />
      </div>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Documentos</h1>
          <p>Gerenciamento de documentos fiscais e operacionais</p>
        </div>
        <button className="btn-new" onClick={() => setShowForm(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Novo Documento
        </button>
      </div>

      {error && (
        <div className="error-alert">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {showForm ? (
        <div className="form-container">
          <div className="form-header">
            <h2>{editId ? 'Editar Documento' : 'Novo Documento'}</h2>
            <button onClick={resetForm} className="close-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Empresa <span className="required">*</span></label>
              <select
                value={formData.empresa_id || ''}
                onChange={(e) => setFormData({ ...formData, empresa_id: Number(e.target.value) })}
                required
              >
                <option value="">Selecione uma empresa...</option>
                {empresas.map(empresa => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.razao_social}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de Documento <span className="required">*</span></label>
              <select
                value={formData.tipo_documento || ''}
                onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value as TipoDocumento })}
                required
              >
                <option value="">Selecione um tipo...</option>
                {Object.values(TipoDocumento).map(tipo => (
                  <option key={tipo} value={tipo}>
                    {TIPO_DOCUMENTO_LABELS[tipo]}
                  </option>
                ))}
              </select>
            </div>

            {getCamposPorTipo().map(campo => renderCampo(campo))}

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancelar
              </button>
              <button type="submit" className="btn-submit">
                {editId ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="content">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Número</th>
                  <th>Data</th>
                  <th>Empresa</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {documentos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      Nenhum documento cadastrado
                    </td>
                  </tr>
                ) : (
                  documentos.map(documento => (
                    <tr key={documento.id}>
                      <td>{documento.id}</td>
                      <td>
                        <span className="badge-tipo">
                          {TIPO_DOCUMENTO_LABELS[documento.tipo_documento]}
                        </span>
                      </td>
                      <td>{documento.numero || '-'}</td>
                      <td>
                        {documento.data_registro 
                          ? new Date(documento.data_registro).toLocaleDateString('pt-BR') 
                          : '-'}
                      </td>
                      <td>
                        {empresas.find(e => e.id === documento.empresa_id)?.razao_social || 'N/A'}
                      </td>
                      <td>
                        {documento.valor 
                          ? `R$ ${Number(documento.valor).toFixed(2)}` 
                          : '-'}
                      </td>
                      <td>
                        <div className="actions">
                          <button 
                            className="btn-edit" 
                            onClick={() => handleEdit(documento)}
                            title="Editar"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.33301 14.6667L2.66634 10.6667L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => setDeleteId(documento.id)}
                            title="Excluir"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <DeleteConfirmModal
          itemName={`documento #${deleteId}`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <style jsx>{`
        .container {
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
          font-size: 2rem;
          color: #1f2937;
        }

        .header p {
          margin: 0.5rem 0 0 0;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .btn-new {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #556b2f;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-new:hover {
          background: #465a26;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #991b1b;
        }

        .error-alert .close-btn {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
          color: #991b1b;
          padding: 0.25rem;
          display: flex;
          align-items: center;
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
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #1f2937;
        }

        .form-header .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .form-header .close-btn:hover {
          color: #1f2937;
        }

        form {
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
          font-size: 0.95rem;
        }

        .required {
          color: #dc2626;
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

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
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

        td {
          padding: 1rem;
          color: #1f2937;
        }

        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 3rem 1rem;
        }

        .badge-tipo {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
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
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
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

        @media (max-width: 768px) {
          .container {
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

export default DocumentosCRUD;
