import React, { useState, useEffect } from 'react';
import type { Item, CreateItemDTO, UpdateItemDTO, TipoItem } from '../types';
import { grupoItemService } from '../../../src/features/estoque/services/grupo-item.service';
import type { GrupoItem } from '../../../src/features/estoque/types/grupo-item';
import { useUnidades } from '../hooks';

interface ItemFormProps {
  item?: Item;
  onSubmit: (data: CreateItemDTO | UpdateItemDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TIPOS_ITEM: { value: TipoItem; label: string }[] = [
  { value: "Produto" as TipoItem, label: "Produto" },
  { value: "Produto em Criação" as TipoItem, label: "Produto em Criação" },
  { value: "Insumo" as TipoItem, label: "Insumo" },
  { value: "Imobilizado" as TipoItem, label: "Imobilizado" },
  { value: "Servico" as TipoItem, label: "Serviço" },
  { value: "Embalagem" as TipoItem, label: "Embalagem" },
  { value: "Outros" as TipoItem, label: "Outros" },
];

export default function ItemForm({ item, onSubmit, onCancel, isLoading }: ItemFormProps) {
  const [gruposLeaves, setGruposLeaves] = useState<GrupoItem[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const { unidades, loading: loadingUnidades } = useUnidades();
  
  const [formData, setFormData] = useState({
    descricao: item?.descricao || '',
    tipo: item?.tipo || ("Produto" as TipoItem),
    grupo_id: item?.grupo_id || null,
    unidade_padrao_id: item?.unidade_padrao_id || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadGruposLeaves = async () => {
      try {
        setLoadingGrupos(true);
        const grupos = await grupoItemService.getLeaves();
        setGruposLeaves(grupos);
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
      } finally {
        setLoadingGrupos(false);
      }
    };

    loadGruposLeaves();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
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
      console.error('Erro ao salvar item:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Descrição *
          <input
            type="text"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            style={{
              ...styles.input,
              ...(errors.descricao ? styles.inputError : {})
            }}
            placeholder="Digite a descrição do item"
            maxLength={255}
          />
        </label>
        {errors.descricao && <span style={styles.errorText}>{errors.descricao}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Tipo *
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoItem })}
            style={{
              ...styles.select,
              ...(errors.tipo ? styles.inputError : {})
            }}
          >
            {TIPOS_ITEM.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </label>
        {errors.tipo && <span style={styles.errorText}>{errors.tipo}</span>}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Grupo
          <select
            value={formData.grupo_id || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              grupo_id: e.target.value ? Number(e.target.value) : null 
            })}
            style={styles.select}
            disabled={loadingGrupos}
          >
            <option value="">Nenhum grupo</option>
            {gruposLeaves.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nome}
              </option>
            ))}
          </select>
        </label>
        {loadingGrupos && (
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Carregando grupos...
          </span>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Unidade Padrão
          <select
            value={formData.unidade_padrao_id || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              unidade_padrao_id: e.target.value ? Number(e.target.value) : null 
            })}
            style={styles.select}
            disabled={loadingUnidades}
          >
            <option value="">Nenhuma unidade</option>
            {unidades.map((unidade) => (
              <option key={unidade.id} value={unidade.id}>
                {unidade.sigla} - {unidade.descricao}
              </option>
            ))}
          </select>
        </label>
        {loadingUnidades && (
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Carregando unidades...
          </span>
        )}
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
          {isLoading ? 'Salvando...' : item ? 'Atualizar' : 'Criar'}
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
    maxWidth: '600px',
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
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  input: {
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s',
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
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
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
