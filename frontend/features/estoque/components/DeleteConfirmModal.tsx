import React from 'react';
import type { Item } from '../types';

interface DeleteConfirmModalProps {
  item: Item;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  item,
  onConfirm,
  onCancel,
  isLoading
}: DeleteConfirmModalProps) {
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.icon}>⚠️</span>
          <h2 style={styles.title}>Confirmar Exclusão</h2>
        </div>
        
        <div style={styles.content}>
          <p style={styles.message}>
            Tem certeza que deseja excluir este item?
          </p>
          <div style={styles.itemInfo}>
            <p><strong>Descrição:</strong> {item.descricao}</p>
            <p><strong>Tipo:</strong> {item.tipo}</p>
          </div>
          <p style={styles.warning}>
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div style={styles.actions}>
          <button
            onClick={onCancel}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={styles.confirmButton}
            disabled={isLoading}
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s ease-out',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    maxWidth: '28rem',
    width: '90%',
    animation: 'slideUp 0.3s ease-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  icon: {
    fontSize: '1.5rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600' as const,
    color: '#111827',
    margin: 0,
  },
  content: {
    padding: '1.5rem',
  },
  message: {
    fontSize: '0.875rem',
    color: '#374151',
    marginBottom: '1rem',
  },
  itemInfo: {
    backgroundColor: '#f9fafb',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    color: '#374151',
  },
  warning: {
    fontSize: '0.75rem',
    color: '#ef4444',
    fontWeight: '500' as const,
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1.5rem',
    borderTop: '1px solid #e5e7eb',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '0.625rem 1.25rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirmButton: {
    padding: '0.625rem 1.25rem',
    border: 'none',
    borderRadius: '0.375rem',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
