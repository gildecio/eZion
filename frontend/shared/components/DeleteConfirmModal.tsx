interface DeleteConfirmModalProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal = ({ itemName, onConfirm, onCancel }: DeleteConfirmModalProps) => {
  return (
    <>
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Confirmar Exclusão</h2>
          </div>

          <div className="modal-body">
            <p>Tem certeza que deseja excluir <strong>{itemName}</strong>?</p>
            <p className="warning-text">Esta ação não pode ser desfeita.</p>
          </div>

          <div className="modal-footer">
            <button onClick={onCancel} className="btn-cancel">
              Cancelar
            </button>
            <button onClick={onConfirm} className="btn-confirm">
              Excluir
            </button>
          </div>
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
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                      0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-body p {
          margin: 0 0 1rem 0;
          color: #374151;
          line-height: 1.5;
        }

        .modal-body p:last-child {
          margin-bottom: 0;
        }

        .warning-text {
          color: #dc2626;
          font-size: 0.875rem;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-cancel,
        .btn-confirm {
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

        .btn-confirm {
          background: #dc2626;
          color: white;
        }

        .btn-confirm:hover {
          background: #b91c1c;
        }
      `}</style>
    </>
  );
};
