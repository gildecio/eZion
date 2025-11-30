import React, { useState, useEffect } from 'react';
import type { Item, CreateItemDTO, UpdateItemDTO, TipoItem } from '../types';
import { grupoItemService } from '../../../src/features/estoque/services/grupo-item.service';
import type { GrupoItem, GrupoItemTree } from '../types/grupo-item';
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
  const [gruposTree, setGruposTree] = useState<GrupoItemTree[]>([]);
  const [leafPaths, setLeafPaths] = useState<Map<number, string>>(new Map());
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [locais, setLocais] = useState<Local[]>([]);
  const [loadingLocais, setLoadingLocais] = useState(true);
  const { unidades, loading: loadingUnidades } = useUnidades();
  
  const [formData, setFormData] = useState(() => {
    // Seleciona o primeiro local como padrão se não houver item
    let defaultEntrada = 0;
    let defaultSaida = 0;
    return {
      codigo: item?.codigo || '',
      codigo_alternativo: item?.codigo_alternativo || '',
      descricao: item?.descricao || '',
      tipo: item?.tipo || ("Produto" as TipoItem),
      grupo_id: item?.grupo_id || null,
      unidade_padrao_id: item?.unidade_padrao_id || null,
      local_padrao_entrada_id: item?.local_padrao_entrada_id ?? defaultEntrada,
      local_padrao_saida_id: item?.local_padrao_saida_id ?? defaultSaida,
    };
  });

  // Estado para embalagens pendentes (antes de salvar o item)
  const [pendingEmbalagens, setPendingEmbalagens] = useState<CreateItemEmbalagemFromCatalogDTO[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadGruposTree = async () => {
      try {
        setLoadingGrupos(true);
        const tree = await grupoItemService.getTree();
        setGruposTree(tree);
        // Monta um mapa de grupo_id folha para caminho completo
        const paths = new Map<number, string>();
        const buildPaths = (node: GrupoItemTree, parentPath: string[] = []) => {
          const currentPath = [...parentPath, node.nome];
          if (node.is_leaf) {
            paths.set(node.id, currentPath.join(' > '));
          }
          if (node.children && node.children.length > 0) {
            node.children.forEach((child: GrupoItemTree) => buildPaths(child, currentPath));
          }
        };
        tree.forEach((root: GrupoItemTree) => buildPaths(root));
        setLeafPaths(paths);
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

    loadGruposTree();
    loadLocais();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Código não é mais obrigatório (gerado automaticamente)

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }

    if (!formData.unidade_padrao_id) {
      newErrors.unidade_padrao_id = 'Unidade padrão é obrigatória';
    }

    if (!formData.grupo_id) {
      newErrors.grupo_id = 'Grupo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      // Se o campo código alternativo não for preenchido, atribui o valor do código
      const dataToSend = {
        ...formData,
        codigo_alternativo: formData.codigo_alternativo?.trim() ? formData.codigo_alternativo : formData.codigo
      };
      await onSubmit(dataToSend, pendingEmbalagens.length > 0 ? pendingEmbalagens : undefined);
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
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'start', margin: 0, padding: 0 }} onKeyDown={(e) => {
          // Prevent form submission on Enter in the item tab
          if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Código
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                style={{
                  ...styles.input,
                  backgroundColor: '#f3f4f6',
                  cursor: 'not-allowed'
                }}
                placeholder={item ? "Código não pode ser alterado" : "Gerado automaticamente"}
                maxLength={50}
                readOnly
                disabled
              />
            </label>
            <small style={styles.helpText}>
              {!item ? 'Será gerado automaticamente ao salvar' : 'Código não pode ser alterado'}
            </small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="codigo_alternativo">Código Alternativo</label>
            <input
              id="codigo_alternativo"
              type="text"
              value={formData.codigo_alternativo}
              onChange={(e) => setFormData({ ...formData, codigo_alternativo: e.target.value })}
              style={styles.input}
              placeholder="Código alternativo (opcional)"
              maxLength={50}
            />
            <small style={styles.helpText}>Se não preenchido, receberá o mesmo valor do código ao salvar</small>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="descricao">Item *</label>
            <input
              id="descricao"
              type="text"
              value={formData.descricao || ''}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              style={{
                ...styles.input,
                ...(errors.descricao ? styles.inputError : {})
              }}
              placeholder="Digite o nome do item"
              maxLength={255}
            />
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
              Grupo *
              <select
                value={formData.grupo_id || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  grupo_id: e.target.value ? Number(e.target.value) : null 
                })}
                style={{
                  ...styles.select,
                  ...(errors.grupo_id ? styles.inputError : {})
                }}
                disabled={loadingGrupos}
              >
                <option value="">Selecione o grupo...</option>
                {[...leafPaths.entries()].map(([id, path]) => (
                  <option key={id} value={id}>
                    {path}
                  </option>
                ))}
              </select>
            </label>
            {errors.grupo_id && <span style={styles.errorText}>{errors.grupo_id}</span>}
            {loadingGrupos && (
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Carregando grupos...
              </span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Unidade Padrão *
              <select
                value={formData.unidade_padrao_id || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  unidade_padrao_id: e.target.value ? Number(e.target.value) : null 
                })}
                style={{
                  ...styles.select,
                  ...(errors.unidade_padrao_id ? styles.inputError : {})
                }}
                disabled={loadingUnidades}
              >
                <option value="">Selecione a unidade...</option>
                {unidades.map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.sigla} - {unidade.descricao}
                  </option>
                ))}
              </select>
            </label>
            {errors.unidade_padrao_id && <span style={styles.errorText}>{errors.unidade_padrao_id}</span>}
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
                {locais.length > 0 && locais.map((local, idx) => (
                  <option key={local.id} value={local.id}>
                    {local.nome}
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
                {locais.length > 0 && locais.map((local, idx) => (
                  <option key={local.id} value={local.id}>
                    {local.nome}
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
              {isLoading ? 'Salvando...' : item ? 'Atualizar' : 'Salvar'}
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
  helpText: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-start',
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
