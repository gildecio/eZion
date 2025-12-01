'use client';

import React, { useState, useEffect } from 'react';
import type { CreateRequisicaoDTO, Requisicao, UpdateRequisicaoDTO, RequisicaoItem } from '../types/requisicao';
import { useItens } from '../hooks/useItens';
import { useEmbalagens } from '../hooks/useEmbalagens';
import { useSaldos } from '../hooks/useSaldos';
import type { Item } from '../types/item';
import type { EmbalagemItemWithUnidade } from '../types/embalagem';
import { useAuth } from '../../../contexts/AuthContext';

// Tipo local para itens da requisição com informações completas
interface RequisicaoItemComInfo extends RequisicaoItem {
  item_info?: Item;
  embalagem_info?: EmbalagemItemWithUnidade;
}

interface Props {
  requisicao?: Requisicao;
  onSubmit: (data: CreateRequisicaoDTO | UpdateRequisicaoDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function RequisicaoForm({ requisicao, onSubmit, onCancel, isLoading }: Props) {
  const { user } = useAuth();
  const { itens, loading: loadingItens, error: errorItens } = useItens();
  const [itensReq, setItensReq] = useState<RequisicaoItemComInfo[]>(requisicao?.itens || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [novoItemId, setNovoItemId] = useState<number>(0);
  const [novaQuantidade, setNovaQuantidade] = useState<number>(1);
  const { embalagens, loading: loadingEmbalagens } = useEmbalagens(novoItemId || undefined);
  const [novaEmbalagemId, setNovaEmbalagemId] = useState<number>(0);
  
  // Buscar saldos do item selecionado
  const { saldos: saldosItem, loading: loadingSaldos, fetchSaldos } = useSaldos();
  const [saldoDisponivel, setSaldoDisponivel] = useState<number>(0);

  // Calcular saldo disponível quando item muda
  useEffect(() => {
    if (novoItemId) {
      fetchSaldos({ item_id: novoItemId });
    }
  }, [novoItemId, fetchSaldos]);

  // Atualizar saldo disponível quando saldos são carregados
  useEffect(() => {
    if (saldosItem.length > 0) {
      const totalSaldo = saldosItem.reduce((acc, saldo) => acc + saldo.quantidade, 0);
      setSaldoDisponivel(totalSaldo);
    } else {
      setSaldoDisponivel(0);
    }
  }, [saldosItem]);

  // Selecionar embalagem padrão automaticamente quando embalagens são carregadas
  useEffect(() => {
    if (embalagens.length > 0) {
      const embalagemPadrao = embalagens.find(emb => emb.padrao);
      if (embalagemPadrao) {
        setNovaEmbalagemId(embalagemPadrao.id);
      } else {
        // Se não há embalagem padrão, seleciona a primeira
        setNovaEmbalagemId(embalagens[0].id);
      }
    } else {
      setNovaEmbalagemId(0);
    }
  }, [embalagens]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (itensReq.length === 0) {
      newErrors.itens = 'Adicione pelo menos um item à requisição';
    }

    itensReq.forEach((item, idx) => {
      if (!item.item_id) {
        newErrors[`item_${idx}_id`] = 'Selecione um item';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (!novoItemId || !novaEmbalagemId || novaQuantidade <= 0) {
      return;
    }

    // Buscar informações do item e embalagem selecionados
    const itemInfo = itens.find(i => i.id === novoItemId);
    const embalagemInfo = embalagens.find(e => e.id === novaEmbalagemId);

    if (!itemInfo || !embalagemInfo) {
      return;
    }

    setItensReq([...itensReq, {
      item_id: novoItemId,
      embalagem_id: novaEmbalagemId,
      quantidade: novaQuantidade,
      item_info: itemInfo,
      embalagem_info: embalagemInfo
    }]);
    // Limpa erros relacionados aos itens quando adiciona um novo
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith('item_')) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);

    // Limpa os campos do novo item
    setNovoItemId(0);
    setNovaEmbalagemId(0);
    setNovaQuantidade(1);
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
      // Remover informações extras antes de enviar para a API
      const itensParaEnvio = itensReq.map(item => ({
        item_id: item.item_id,
        embalagem_id: item.embalagem_id,
        quantidade: item.quantidade
      }));
      onSubmit({ solicitante: user?.name || '', itens: itensParaEnvio });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGrid}>
        {requisicao && (
          <>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Número
              </label>
              <div style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: '#f9fafb', color: '#6b7280' }}>
                {requisicao.numero}
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Série
              </label>
              <div style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: '#f9fafb', color: '#6b7280' }}>
                {requisicao.serie || '-'}
              </div>
            </div>
          </>
        )}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Solicitante
          </label>
          <div style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: '#f9fafb', color: '#6b7280' }}>
            {user?.name || 'Usuário não identificado'}
          </div>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Itens da Requisição *
        </label>

        {/* Form para adicionar novo item */}
        <div style={styles.addItemForm}>
          <div style={styles.addItemField}>
            <select
              value={novoItemId}
              onChange={(e) => setNovoItemId(Number(e.target.value))}
              style={styles.select}
              disabled={loadingItens}
            >
              <option value={0}>
                {loadingItens ? 'Carregando itens...' : errorItens ? `Erro: ${errorItens}` : itens.length === 0 ? 'Nenhum item disponível' : 'Selecione o item...'}
              </option>
              {itens.map(i => (
                <option key={i.id} value={i.id}>{i.codigo} - {i.descricao}</option>
              ))}
            </select>
            {errorItens && <span style={styles.errorText}>{errorItens}</span>}
          </div>

          <div style={styles.addItemField}>
            <select
              value={novaEmbalagemId}
              onChange={(e) => setNovaEmbalagemId(Number(e.target.value))}
              style={styles.select}
              disabled={loadingEmbalagens || !novoItemId}
            >
              <option value={0}>
                {!novoItemId ? 'Selecione um item primeiro' : loadingEmbalagens ? 'Carregando embalagens...' : embalagens.length === 0 ? 'Nenhuma embalagem disponível' : 'Selecione a embalagem...'}
              </option>
              {embalagens.map(emb => (
                <option key={emb.id} value={emb.id}>
                  {emb.descricao} {emb.padrao ? '(Padrão)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.addSaldoField}>
            <div style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '0.875rem' }}>
              Saldo: {loadingSaldos ? '...' : saldoDisponivel.toFixed(2)}
            </div>
          </div>

          <div style={styles.addQuantityField}>
            <input
              type="number"
              min={1}
              step={1}
              value={novaQuantidade}
              onChange={(e) => setNovaQuantidade(Number(e.target.value))}
              style={{
                ...styles.input,
                width: '80px',
              }}
              placeholder="Qtd"
            />
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            style={styles.addItemButton}
            disabled={!novoItemId || !novaEmbalagemId || novaQuantidade <= 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar
          </button>
        </div>

        {/* Tabela com itens adicionados */}
        {itensReq.length > 0 && (
          <div style={styles.itemsTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Item</th>
                  <th style={styles.tableHeader}>Embalagem</th>
                  <th style={styles.tableHeader}>Quantidade</th>
                  <th style={styles.tableHeader}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensReq.map((item, idx) => {
                  const itemInfo = item.item_info || itens.find(i => i.id === item.item_id);
                  const embalagemInfo = item.embalagem_info;
                  return (
                    <tr key={idx} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        {itemInfo ? `${itemInfo.codigo} - ${itemInfo.descricao}` : 'Item não encontrado'}
                      </td>
                      <td style={styles.tableCell}>
                        {embalagemInfo ? embalagemInfo.descricao : 'Embalagem não encontrada'}
                      </td>
                      <td style={styles.tableCell}>
                        {item.quantidade}
                      </td>
                      <td style={styles.tableCell}>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {itensReq.length === 0 && (
          <div style={styles.emptyItems}>
            Nenhum item adicionado ainda.
          </div>
        )}

        {errors.itens && <span style={styles.errorText}>{errors.itens}</span>}
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    alignItems: 'start',
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
  },
  addItemForm: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  addItemField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  addSaldoField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    minWidth: '120px',
  },
  addQuantityField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    minWidth: '100px',
  },
  addItemButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    backgroundColor: '#556b2f',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
    ':disabled': {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
    },
  },
  itemsTable: {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeader: {
    padding: '0.75rem 1rem',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'left' as const,
    fontSize: '0.875rem',
    fontWeight: '600' as const,
    color: '#374151',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    padding: '1rem',
    verticalAlign: 'middle' as const,
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
