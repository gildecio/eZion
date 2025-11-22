import React, { useState } from 'react';
import type { Lote, CreateLoteDTO, UpdateLoteDTO } from '../types';

interface LoteFormProps {
  lote?: Lote;
  onSubmit: (data: CreateLoteDTO | UpdateLoteDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function LoteForm({ lote, onSubmit, onCancel, isLoading }: LoteFormProps) {
  const [formData, setFormData] = useState({
    lote: lote?.lote || '',
    validade: lote?.validade || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.lote.trim()) {
      newErrors.lote = 'Lote é obrigatório';
    }

    if (!formData.validade.trim()) {
      newErrors.validade = 'Validade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar lote:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Lote *
          <input
            type="text"
            value={formData.lote}
            onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
            style={{
              ...styles.input,
              ...(errors.lote ? styles.inputError : {})
            }}
            placeholder="Digite o número do lote"
            maxLength={50}
          />
        </label>
        {errors.lote && <span style={styles.errorText}>{errors.lote}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Validade *
          <input
            type="date"
            value={formData.validade}
            onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
            style={{
              ...styles.input,
              ...(errors.validade ? styles.inputError : {})
            }}
          />
        </label>
        {errors.validade && <span style={styles.errorText}>{errors.validade}</span>}
      </div>

      <div style={styles.buttonGroup}>
        <button
          type="button"
          onClick={onCancel}
          style={styles.cancelButton}
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          style={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : lote ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500' as const,
    color: '#374151',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: '12px',
    color: '#ef4444',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500' as const,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  submitButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500' as const,
    color: 'white',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};
