import { useState } from 'react';
import { useEmpresas } from '../hooks/useEmpresas';
import EmpresaTable from '../components/EmpresaTable';
import EmpresaForm from '../components/EmpresaForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import type { Empresa, CreateEmpresaDTO, UpdateEmpresaDTO } from '../types';

export default function EmpresasCRUD() {
  const { empresas, loading, create, update, remove, refresh } = useEmpresas();
  const [showForm, setShowForm] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = () => {
    setSelectedEmpresa(null);
    setShowForm(true);
  };

  const handleEdit = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setShowForm(true);
  };

  const handleDelete = (empresa: Empresa) => {
    setEmpresaToDelete(empresa);
  };

  const handleSubmit = async (data: CreateEmpresaDTO | UpdateEmpresaDTO) => {
    setIsSubmitting(true);
    try {
      if (selectedEmpresa) {
        await update(selectedEmpresa.id, data as UpdateEmpresaDTO);
      } else {
        await create(data as CreateEmpresaDTO);
      }
      setShowForm(false);
      setSelectedEmpresa(null);
      await refresh();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert('Erro ao salvar empresa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!empresaToDelete) return;

    setIsSubmitting(true);
    try {
      await remove(empresaToDelete.id);
      setEmpresaToDelete(null);
      await refresh();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      alert('Erro ao excluir empresa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedEmpresa(null);
  };

  return (
    <div className="empresas-crud">
      <div className="header">
        <div>
          <h1>Empresas</h1>
          <p>Gerencie as empresas cadastradas no sistema</p>
        </div>
        {!showForm && (
          <button onClick={handleCreate} className="btn-new">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Empresa
          </button>
        )}
      </div>

      <div className="content">
        {showForm ? (
          <div className="form-container">
            <div className="form-header">
              <h2>{selectedEmpresa ? 'Editar Empresa' : 'Nova Empresa'}</h2>
              <button onClick={handleCancel} className="btn-close" title="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <EmpresaForm
              empresa={selectedEmpresa || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </div>
        ) : (
          <EmpresaTable
            empresas={empresas}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={loading}
          />
        )}
      </div>

      {empresaToDelete && (
        <DeleteConfirmModal
          empresa={empresaToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setEmpresaToDelete(null)}
          isLoading={isSubmitting}
        />
      )}

      <style jsx>{`
        .empresas-crud {
          padding: 2rem;
          max-width: 1400px;
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
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
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
          .empresas-crud {
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
