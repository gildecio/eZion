import type { Empresa } from '../types';

interface DeleteConfirmModalProps {
  empresa: Empresa;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({ empresa, onConfirm, onCancel, isLoading }: DeleteConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="icon-warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2>Confirmar exclusão</h2>
        </div>

        <div className="modal-body">
          <p>Tem certeza que deseja excluir a empresa?</p>
          <div className="empresa-info">
            <strong>{empresa.razao_social}</strong>
            <span>CNPJ: {empresa.cnpj}</span>
          </div>
          <p className="warning-text">Esta ação não pode ser desfeita.</p>
        </div>

        <div className="modal-footer">
          <button onClick={onCancel} disabled={isLoading} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={isLoading} className="btn-confirm">
            {isLoading ? 'Excluindo...' : 'Sim, excluir'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 450px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.2s;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          padding: 1.5rem 1.5rem 1rem;
          text-align: center;
        }

        .icon-warning {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          background: #fef3c7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d97706;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .modal-body {
          padding: 0 1.5rem 1.5rem;
        }

        .modal-body p {
          margin: 0 0 1rem 0;
          color: #6b7280;
          font-size: 0.875rem;
          text-align: center;
        }

        .empresa-info {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .empresa-info strong {
          display: block;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .empresa-info span {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .warning-text {
          color: #dc2626 !important;
          font-weight: 500;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .btn-cancel,
        .btn-confirm {
          padding: 0.625rem 1.25rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 0.875rem;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-confirm {
          background: #dc2626;
          color: white;
        }

        .btn-confirm:hover:not(:disabled) {
          background: #b91c1c;
        }

        .btn-cancel:disabled,
        .btn-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
