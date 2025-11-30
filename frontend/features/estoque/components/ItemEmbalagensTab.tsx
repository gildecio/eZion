import React, { useEffect, useState } from 'react';
import { Item, EmbalagemItem, EmbalagemCatalogo } from '../types';
import { itemEmbalagensService, embalagemCatalogoService } from '../services';
import { useUnidades } from '../hooks/useUnidades';
import type { CreateItemEmbalagemFromCatalogDTO } from '../types/embalagem';

interface ItemEmbalagensTabProps {
  item?: Item; // Opcional para quando estiver criando novo item
  unidadePadraoId?: number | null; // Unidade do item (para filtrar catálogo)
  pendingEmbalagens?: CreateItemEmbalagemFromCatalogDTO[]; // Embalagens antes de salvar
  onPendingEmbalagensChange?: (embalagens: CreateItemEmbalagemFromCatalogDTO[]) => void;
}

const ItemEmbalagensTab: React.FC<ItemEmbalagensTabProps> = ({ 
  item, 
  unidadePadraoId,
  pendingEmbalagens = [],
  onPendingEmbalagensChange
}) => {
  const [embalagens, setEmbalagens] = useState<EmbalagemItem[]>([]);
  const [catalogo, setCatalogo] = useState<EmbalagemCatalogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { unidades } = useUnidades();

  // Modo de criação (item ainda não existe)
  const isCreatingMode = !item;

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    catalogo_embalagem_id: 0,
    fator_conversao: 1,
    codigo_barras: '',
    padrao: false,
  });

  const [editFormData, setEditFormData] = useState({
    codigo_barras: '',
    padrao: false,
  });

  useEffect(() => {
    if (item) {
      loadEmbalagens();
    }
    loadCatalogo();
  }, [item?.id]);

  const loadEmbalagens = async () => {
    if (!item) return;
    try {
      setLoading(true);
      const data = await itemEmbalagensService.list(item.id);
      setEmbalagens(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar embalagens do item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogo = async () => {
    try {
      const data = await embalagemCatalogoService.getAll();
      // Filter by item's unidade_padrao_id if available
      const itemUnidadeId = item?.unidade_padrao_id || unidadePadraoId;
      const filtered = itemUnidadeId
        ? data.filter(e => e.unidade_id === itemUnidadeId && e.ativo)
        : data.filter(e => e.ativo);
      setCatalogo(filtered);
    } catch (err) {
      console.error('Erro ao carregar catálogo:', err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.catalogo_embalagem_id === 0) {
      alert('Selecione uma embalagem do catálogo');
      return;
    }

    // Modo de criação: adicionar à lista pendente
    if (isCreatingMode) {
      const catalogoEmb = catalogo.find(c => c.id === formData.catalogo_embalagem_id);
      if (!catalogoEmb) return;

      // Verificar duplicata
      const isDuplicate = pendingEmbalagens.some(
        p => p.catalogo_embalagem_id === formData.catalogo_embalagem_id
      );
      
      if (isDuplicate) {
        setError('Esta embalagem já foi adicionada');
        return;
      }

      const newEmbalagem: CreateItemEmbalagemFromCatalogDTO = {
        catalogo_embalagem_id: formData.catalogo_embalagem_id,
        fator_conversao: 1,
        codigo_barras: formData.codigo_barras || undefined,
        padrao: formData.padrao,
      };

      // Se esta for marcada como padrão, desmarcar as outras
      const updatedPending = formData.padrao
        ? pendingEmbalagens.map(p => ({ ...p, padrao: false }))
        : pendingEmbalagens;

      onPendingEmbalagensChange?.([...updatedPending, newEmbalagem]);
      
      setFormData({
        catalogo_embalagem_id: 0,
        fator_conversao: 1,
        codigo_barras: '',
        padrao: false,
      });
      setIsAdding(false);
      setError(null);
      return;
    }

    // Modo de edição: salvar no backend
    try {
      setLoading(true);
      await itemEmbalagensService.createFromCatalog(item!.id, {
        catalogo_embalagem_id: formData.catalogo_embalagem_id,
        fator_conversao: formData.fator_conversao,
        codigo_barras: formData.codigo_barras || undefined,
        padrao: formData.padrao,
      });
      await loadEmbalagens();
      setFormData({
        catalogo_embalagem_id: 0,
        fator_conversao: 1,
        codigo_barras: '',
        padrao: false,
      });
      setIsAdding(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao adicionar embalagem');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (embalagemId: number) => {
    try {
      setLoading(true);
      await itemEmbalagensService.update(item.id, embalagemId, {
        codigo_barras: editFormData.codigo_barras || undefined,
        padrao: editFormData.padrao,
      });
      await loadEmbalagens();
      setEditingId(null);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao atualizar embalagem');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (embalagemId: number) => {
    // Modo de criação: atualizar lista pendente
    if (isCreatingMode) {
      handleSetDefaultPending(embalagemId);
      return;
    }

    // Modo de edição: atualizar no backend
    try {
      setLoading(true);
      await itemEmbalagensService.setDefault(item!.id, embalagemId);
      await loadEmbalagens();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao definir embalagem padrão');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (embalagemId: number) => {
    if (!confirm('Deseja realmente remover esta embalagem do item?')) {
      return;
    }

    // Modo de criação: remover da lista pendente
    if (isCreatingMode) {
      const updated = pendingEmbalagens.filter(p => p.catalogo_embalagem_id !== embalagemId);
      onPendingEmbalagensChange?.(updated);
      return;
    }

    // Modo de edição: deletar do backend
    try {
      setLoading(true);
      await itemEmbalagensService.delete(item!.id, embalagemId);
      await loadEmbalagens();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao remover embalagem');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultPending = (catalogoEmbId: number) => {
    const updated = pendingEmbalagens.map(p => ({
      ...p,
      padrao: p.catalogo_embalagem_id === catalogoEmbId
    }));
    onPendingEmbalagensChange?.(updated);
  };

  const handleEditPending = (catalogoEmbId: number, updates: Partial<CreateItemEmbalagemFromCatalogDTO>) => {
    const updated = pendingEmbalagens.map(p => {
      if (p.catalogo_embalagem_id === catalogoEmbId) {
        // Se estiver setando como padrão, desmarcar as outras
        if (updates.padrao === true) {
          return { ...p, ...updates };
        }
        return { ...p, ...updates };
      }
      // Se estiver setando outro como padrão, desmarcar este
      if (updates.padrao === true) {
        return { ...p, padrao: false };
      }
      return p;
    });
    onPendingEmbalagensChange?.(updated);
  };

  const startEdit = (embalagem: EmbalagemItem) => {
    setEditingId(embalagem.unidade_id);
    setEditFormData({
      codigo_barras: embalagem.codigo_barras || '',
      padrao: embalagem.padrao,
    });
  };

  const getUnidadeSigla = (unidadeId: number) => {
    return unidades.find(u => u.id === unidadeId)?.sigla || `Unidade ${unidadeId}`;
  };

  if (loading && embalagens.length === 0) {
    return <div style={styles.loading}>Carregando embalagens...</div>;
  }

  return (
    <div style={styles.container}>
      {isCreatingMode && (
        <div style={styles.infoBox}>
          ℹ️ As embalagens serão salvas automaticamente quando você salvar o item.
        </div>
      )}
      
      <div style={styles.header}>
        <h3 style={styles.title}>Embalagens do Item</h3>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          style={styles.addButton}
          disabled={loading}
        >
          {isAdding ? 'Cancelar' : '+ Adicionar Embalagem'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {isAdding && (
        <form onSubmit={handleAdd} style={styles.form}>
          <h4 style={styles.formTitle}>Nova Embalagem</h4>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Embalagem do Catálogo *
                <select
                  value={formData.catalogo_embalagem_id}
                  onChange={(e) => setFormData({ ...formData, catalogo_embalagem_id: Number(e.target.value) })}
                  style={styles.select}
                  required
                >
                  <option value={0}>Selecione...</option>
                  {catalogo.map((emb) => (
                    <option key={emb.id} value={emb.id}>
                      {emb.descricao} ({getUnidadeSigla(emb.unidade_id)}) - Fator: {typeof emb.fator_conversao === 'string' ? emb.fator_conversao : emb.fator_conversao}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Código de Barras
                <input
                  type="text"
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                  style={styles.input}
                  maxLength={50}
                />
              </label>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.padrao}
                  onChange={(e) => setFormData({ ...formData, padrao: e.target.checked })}
                  style={styles.checkbox}
                />
                Embalagem Padrão
              </label>
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setFormData({
                  catalogo_embalagem_id: 0,
                  fator_conversao: 1,
                  codigo_barras: '',
                  padrao: false,
                });
              }}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      )}

      {/* Renderizar embalagens pendentes (modo criação) ou salvas (modo edição) */}
      {(() => {
        const displayEmbalagens = isCreatingMode 
          ? pendingEmbalagens.map(p => {
              const catalogoEmb = catalogo.find(c => c.id === p.catalogo_embalagem_id);
              return {
                id: p.catalogo_embalagem_id,
                descricao: catalogoEmb?.descricao || 'Embalagem',
                unidade_id: catalogoEmb?.unidade_id || 0,
                fator_conversao: catalogoEmb?.fator_conversao || 1,
                codigo_barras: p.codigo_barras || null,
                padrao: p.padrao || false,
              };
            })
          : embalagens.map(e => ({
              id: e.id,
              descricao: e.descricao,
              unidade_id: e.unidade_id,
              fator_conversao: e.fator_conversao,
              codigo_barras: e.codigo_barras,
              padrao: e.padrao,
            }));

        if (displayEmbalagens.length === 0) {
          return (
            <div style={styles.empty}>
              {isCreatingMode 
                ? 'Nenhuma embalagem adicionada. Use o botão "Adicionar Embalagem" para vincular embalagens do catálogo.'
                : 'Nenhuma embalagem associada a este item. Use o botão "Adicionar Embalagem" para vincular embalagens do catálogo.'}
            </div>
          );
        }

        return (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Descrição</th>
                <th style={styles.th}>Unidade</th>
                <th style={styles.th}>Fator</th>
                <th style={styles.th}>Código Barras</th>
                <th style={styles.th}>Padrão</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {displayEmbalagens.map((emb) => (
                <tr key={emb.id} style={styles.tr}>
                  <td style={styles.td}>{emb.descricao}</td>
                  <td style={styles.td}>{getUnidadeSigla(emb.unidade_id)}</td>
                  <td style={styles.td}>{typeof emb.fator_conversao === 'string' ? emb.fator_conversao : emb.fator_conversao}</td>
                  <td style={styles.td}>{emb.codigo_barras || '-'}</td>
                  <td style={styles.td}>
                    {emb.padrao ? (
                      <span style={styles.badge}>Padrão</span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(emb.id)}
                        style={styles.setDefaultButton}
                        disabled={loading}
                      >
                        Definir como Padrão
                      </button>
                    )}
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDelete(emb.id)}
                      style={styles.deleteButton}
                      disabled={loading}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      })()}
    </div>
  );
};

const styles = {
  container: {
    padding: '1rem',
  },
  infoBox: {
    padding: '0.75rem 1rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    border: '1px solid #93c5fd',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600' as const,
    color: '#111827',
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#556b2f',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
  },
  loading: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#6b7280',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  form: {
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
  },
  formTitle: {
    fontSize: '1rem',
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: '1rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    color: '#374151',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  checkboxLabel: {
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1.75rem',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
  },
  inputSmall: {
    padding: '0.25rem 0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    width: '100%',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    backgroundColor: 'white',
  },
  checkbox: {
    width: '1rem',
    height: '1rem',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#556b2f',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
  },
  empty: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.875rem',
  },
  th: {
    padding: '0.75rem',
    textAlign: 'left' as const,
    borderBottom: '2px solid #e5e7eb',
    fontWeight: '600' as const,
    color: '#374151',
    backgroundColor: '#f9fafb',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '0.75rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '500' as const,
  },
  editButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  deleteButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  cancelButtonSmall: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  setDefaultButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
};

export default ItemEmbalagensTab;
