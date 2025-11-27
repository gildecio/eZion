import React, { useState, useEffect } from 'react';
import type { Item, CreateItemDTO, UpdateItemDTO, TipoItem } from '../types';
import { grupoItemService } from '../../../src/features/estoque/services/grupo-item.service';
import type { GrupoItem } from '../../../src/features/estoque/types/grupo-item';
import { useUnidades } from '../hooks';
import { localService } from '../services/local-service';
import type { Local } from '../types/local';
import ItemEmbalagensTab from './ItemEmbalagensTab';
import type { CreateItemEmbalagemFromCatalogDTO } from '../types/embalagem';

interface ItemFormProps {
  item?: Item;
  onSubmit: (data: CreateItemDTO | UpdateItemDTO, pendingEmbalagens?: CreateItemEmbalagemFromCatalogDTO[]) => Promise<void>;
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

type TabType = 'item' | 'embalagens';

export default function ItemForm({ item, onSubmit, onCancel, isLoading }: ItemFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('item');
  const [gruposLeaves, setGruposLeaves] = useState<GrupoItem[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [locais, setLocais] = useState<Local[]>([]);
  const [loadingLocais, setLoadingLocais] = useState(true);
  const { unidades, loading: loadingUnidades } = useUnidades();
  
  const [formData, setFormData] = useState({
    codigo: item?.codigo || '',
    codigo_alternativo: item?.codigo_alternativo || '',
    descricao: item?.descricao || '',
    tipo: item?.tipo || ("Produto" as TipoItem),
    grupo_id: item?.grupo_id || null,
    unidade_padrao_id: item?.unidade_padrao_id || null,
    local_padrao_entrada_id: item?.local_padrao_entrada_id || 0,
    local_padrao_saida_id: item?.local_padrao_saida_id || 0,
  });

  // Estado para embalagens pendentes (antes de salvar o item)
  const [pendingEmbalagens, setPendingEmbalagens] = useState<CreateItemEmbalagemFromCatalogDTO[]>([]);

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

    const loadLocais = async () => {
      try {
        setLoadingLocais(true);
        const locaisData = await localService.getAll(true);
        setLocais(locaisData);
      } catch (error) {
        console.error('Erro ao carregar locais:', error);
      } finally {
        setLoadingLocais(false);
      }
    };

    loadGruposLeaves();
    loadLocais();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    }

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
      // Salvar o item e passar as embalagens pendentes para o componente pai
      await onSubmit(formData, pendingEmbalagens.length > 0 ? pendingEmbalagens : undefined);
    } catch (error) {
      console.error('Erro ao salvar item:', error);
    }
  };

  return (
    <div style={styles.container}>
      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          type="button"
          onClick={() => setActiveTab('item')}
          style={{
            ...styles.tab,
            ...(activeTab === 'item' ? styles.activeTab : {}),
          }}
        >
          Item
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('embalagens')}
          style={{
            ...styles.tab,
            ...(activeTab === 'embalagens' ? styles.activeTab : {}),
          }}
        >
          Embalagens {pendingEmbalagens.length > 0 && `(${pendingEmbalagens.length})`}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'item' ? (
        <form onSubmit={handleSubmit} style={styles.form} onKeyDown={(e) => {
          // Prevent form submission on Enter in the item tab
          if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}>
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
                placeholder="Digite o código do item"
                maxLength={50}
              />
            </label>
            {errors.codigo && <span style={styles.errorText}>{errors.codigo}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Código Alternativo
              <input
                type="text"
                value={formData.codigo_alternativo}
                onChange={(e) => setFormData({ ...formData, codigo_alternativo: e.target.value })}
                style={styles.input}
                placeholder="Código alternativo (opcional)"
                maxLength={50}
              />
            </label>
          </div>

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

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Local Padrão de Entrada
              <select
                value={formData.local_padrao_entrada_id}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  local_padrao_entrada_id: Number(e.target.value)
                })}
                style={styles.select}
                disabled={loadingLocais}
              >
                <option value={0}>Local Padrão (0)</option>
                {locais.map((local) => (
                  <option key={local.id} value={local.id}>
                    {local.codigo} - {local.nome}
                  </option>
                ))}
              </select>
            </label>
            {loadingLocais && (
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Carregando locais...
              </span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Local Padrão de Saída
              <select
                value={formData.local_padrao_saida_id}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  local_padrao_saida_id: Number(e.target.value)
                })}
                style={styles.select}
                disabled={loadingLocais}
              >
                <option value={0}>Local Padrão (0)</option>
                {locais.map((local) => (
                  <option key={local.id} value={local.id}>
                    {local.codigo} - {local.nome}
                  </option>
                ))}
              </select>
            </label>
            {loadingLocais && (
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Carregando locais...
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
      ) : (
        <ItemEmbalagensTab 
          item={item} 
          unidadePadraoId={formData.unidade_padrao_id}
          pendingEmbalagens={pendingEmbalagens}
          onPendingEmbalagensChange={setPendingEmbalagens}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '1rem',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
    outline: 'none',
  },
  activeTab: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
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
