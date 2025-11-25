import React, { useState } from 'react';
import type { Lote, CreateLoteDTO, UpdateLoteDTO } from '../types/lote';

interface LoteFormProps {
  lote?: Lote;
  onSubmit: (data: CreateLoteDTO | UpdateLoteDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function LoteForm({ lote, onSubmit, onCancel, isLoading }: LoteFormProps) {
  const [formData, setFormData] = useState({
    codigo: lote?.codigo || '',
    data_validade: lote?.data_validade || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    }

    if (!formData.data_validade.trim()) {
      newErrors.data_validade = 'Validade é obrigatória';
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
          Código *
          <input
            type="text"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            style={{
              ...styles.input,
              ...(errors.codigo ? styles.inputError : {})
            }}
            placeholder="Digite o código do lote"
            maxLength={50}
          />
        </label>
        {errors.codigo && <span style={styles.errorText}>{errors.codigo}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Validade *
          <input
            type="date"
            value={formData.data_validade}
            onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
            style={{
              ...styles.input,
              ...(errors.data_validade ? styles.inputError : {})
            }}
          />
        </label>
        {errors.data_validade && <span style={styles.errorText}>{errors.data_validade}</span>}
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
