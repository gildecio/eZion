import React, { useState } from 'react';
import type { CreateRequisicaoDTO, Requisicao, UpdateRequisicaoDTO, RequisicaoItem } from '../types/requisicao';
import { useItens } from '../hooks/useItens';

interface Props {
  requisicao?: Requisicao;
  onSubmit: (data: CreateRequisicaoDTO | UpdateRequisicaoDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function RequisicaoForm({ requisicao, onSubmit, onCancel, isLoading }: Props) {
  const { itens } = useItens();
  const [solicitante, setSolicitante] = useState(requisicao?.solicitante || '');
  const [observacao, setObservacao] = useState(requisicao?.observacao || '');
  const [itensReq, setItensReq] = useState<RequisicaoItem[]>(requisicao?.itens || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!solicitante.trim()) {
      newErrors.solicitante = 'Solicitante é obrigatório';
    }

    if (itensReq.length === 0) {
      newErrors.itens = 'Adicione pelo menos um item à requisição';
    }

    itensReq.forEach((item, idx) => {
      if (!item.item_id) {
        newErrors[`item_${idx}_id`] = 'Selecione um item';
      }
      if (!item.quantidade || item.quantidade <= 0) {
        newErrors[`item_${idx}_quantidade`] = 'Quantidade deve ser maior que zero';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    setItensReq([...itensReq, { item_id: 0, quantidade: 1 }]);
    // Limpa erros relacionados aos itens quando adiciona um novo
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith('item_')) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const handleItemChange = (idx: number, field: keyof RequisicaoItem, value: any) => {
    const newItens = [...itensReq];
    newItens[idx][field] = value;
    setItensReq(newItens);

    // Limpa erro específico do campo alterado
    const errorKey = `item_${idx}_${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleRemoveItem = (idx: number) => {
    setItensReq(itensReq.filter((_, i) => i !== idx));
    // Remove erros relacionados ao item removido
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`item_${idx}_`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ solicitante, observacao, itens: itensReq });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="solicitante">
          Solicitante *
        </label>
        <input
          id="solicitante"
          type="text"
          value={solicitante}
          onChange={(e) => {
            setSolicitante(e.target.value);
            if (errors.solicitante) {
              setErrors({ ...errors, solicitante: '' });
            }
          }}
          style={{
            ...styles.input,
            ...(errors.solicitante ? styles.inputError : {})
          }}
          placeholder="Digite o nome do solicitante"
          maxLength={255}
        />
        {errors.solicitante && <span style={styles.errorText}>{errors.solicitante}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="observacao">
          Observação
        </label>
        <textarea
          id="observacao"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          style={styles.textarea}
          placeholder="Observações adicionais (opcional)"
          rows={3}
          maxLength={500}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Itens da Requisição *
        </label>

        {itensReq.length === 0 && (
          <div style={styles.emptyItems}>
            Nenhum item adicionado. Clique em "Adicionar Item" para começar.
          </div>
        )}

        {itensReq.map((item, idx) => (
          <div key={idx} style={styles.itemRow}>
            <div style={styles.itemField}>
              <select
                value={item.item_id}
                onChange={(e) => handleItemChange(idx, 'item_id', Number(e.target.value))}
                style={{
                  ...styles.select,
                  ...(errors[`item_${idx}_id`] ? styles.inputError : {})
                }}
              >
                <option value="">Selecione o item...</option>
                {itens.map(i => (
                  <option key={i.id} value={i.id}>{i.codigo} - {i.descricao}</option>
                ))}
              </select>
              {errors[`item_${idx}_id`] && <span style={styles.errorText}>{errors[`item_${idx}_id`]}</span>}
            </div>

            <div style={styles.quantityField}>
              <input
                type="number"
                min={1}
                step={1}
                value={item.quantidade}
                onChange={(e) => handleItemChange(idx, 'quantidade', Number(e.target.value))}
                style={{
                  ...styles.input,
                  width: '80px',
                  ...(errors[`item_${idx}_quantidade`] ? styles.inputError : {})
                }}
                placeholder="Qtd"
              />
              {errors[`item_${idx}_quantidade`] && <span style={styles.errorText}>{errors[`item_${idx}_quantidade`]}</span>}
            </div>

            <button
              type="button"
              onClick={() => handleRemoveItem(idx)}
              style={styles.removeButton}
              title="Remover item"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {errors.itens && <span style={styles.errorText}>{errors.itens}</span>}

        <button
          type="button"
          onClick={handleAddItem}
          style={styles.addButton}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Item
        </button>
      </div>

      <div style={styles.formActions}>
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
          {isLoading ? 'Salvando...' : requisicao ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    maxWidth: '800px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    color: '#374151',
  },
  input: {
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  },
  textarea: {
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  },
  select: {
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputError: {
    borderColor: '#ef4444',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.25rem',
  },
  emptyItems: {
    padding: '1rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    color: '#6b7280',
    fontSize: '0.875rem',
    textAlign: 'center' as const,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    marginBottom: '0.75rem',
  },
  itemField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  quantityField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    minWidth: '100px',
  },
  removeButton: {
    padding: '0.5rem',
    border: 'none',
    borderRadius: '0.375rem',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '0.25rem',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    alignSelf: 'flex-start',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-start',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
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
  submitButton: {
    padding: '0.625rem 1.25rem',
    border: 'none',
    borderRadius: '0.375rem',
    backgroundColor: '#556b2f',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
