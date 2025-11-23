import React, { useState, useEffect } from 'react';
import { ajusteEstoqueService } from '../services/ajuste-estoque-service';
import { ItemService } from '../services/item.service';
import { LoteService } from '../services/lote.service';
import { localService } from '../services/local-service';
import {
  AjusteEstoque,
  CreateAjusteEstoqueDTO,
  UpdateAjusteEstoqueDTO,
  AjusteEstoqueItem,
  CreateAjusteEstoqueItemDTO,
  TIPO_AJUSTE
} from '../types/ajuste-estoque';
import { Item } from '../types/item';
import { Lote } from '../types/lote';
import { Local } from '../types/local';
import { DeleteConfirmModal } from '@/shared/components/DeleteConfirmModal';

interface AjusteEstoqueCRUDProps {
  empresaId: number;
}

const AjusteEstoqueCRUD: React.FC<AjusteEstoqueCRUDProps> = ({ empresaId }) => {
  const itemService = new ItemService();
  const loteService = new LoteService();
  
  const [ajustes, setAjustes] = useState<AjusteEstoque[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Form state - Master
  const [numero, setNumero] = useState('');
  const [dataEntrada, setDataEntrada] = useState(new Date().toISOString().split('T')[0]);
  const [dataRegistro, setDataRegistro] = useState(new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState<'E' | 'S'>('E');
  const [valor, setValor] = useState(0);

  // Form state - Detail (items)
  const [ajusteItens, setAjusteItens] = useState<CreateAjusteEstoqueItemDTO[]>([]);

  // Item form state (for adding new item to ajuste)
  const [itemId, setItemId] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [valorUnitario, setValorUnitario] = useState<number>(0);
  const [loteId, setLoteId] = useState<number | null>(null);
  const [localId, setLocalId] = useState<number | null>(null);
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    loadData();
  }, [empresaId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ajustesData, itensData, lotesData, locaisData] = await Promise.all([
        ajusteEstoqueService.getAll({ empresa_id: empresaId }),
        itemService.getAll(),
        loteService.getAll(),
        localService.getAll()
      ]);
      setAjustes(ajustesData);
      setItens(itensData);
      setLotes(lotesData);
      setLocais(locaisData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openForm = (ajuste?: AjusteEstoque, viewMode = false) => {
    if (ajuste) {
      setEditingId(ajuste.id);
      setNumero(ajuste.numero);
      setDataEntrada(ajuste.data_entrada);
      setDataRegistro(ajuste.data_registro);
      setTipo(ajuste.tipo);
      setValor(ajuste.valor);
      setAjusteItens(ajuste.itens || []);
    } else {
      resetForm();
    }
    setIsViewMode(viewMode);
    setIsFormOpen(true);
  };

  const toggleExpandRow = (ajusteId: number) => {
    setExpandedRow(expandedRow === ajusteId ? null : ajusteId);
  };

  const resetForm = () => {
    setEditingId(null);
    setNumero('');
    setDataEntrada(new Date().toISOString().split('T')[0]);
    setDataRegistro(new Date().toISOString().split('T')[0]);
    setTipo('E');
    setValor(0);
    setAjusteItens([]);
    setIsViewMode(false);
    resetItemForm();
  };

  const resetItemForm = () => {
    setItemId(null);
    setQuantidade(1);
    setValorUnitario(0);
    setLoteId(null);
    setLocalId(null);
    setObservacao('');
  };

  const addItem = () => {
    if (!itemId || quantidade <= 0 || valorUnitario < 0) {
      alert('Preencha item, quantidade e valor unitário corretamente');
      return;
    }

    const valorTotal = quantidade * valorUnitario;
    const newItem: CreateAjusteEstoqueItemDTO = {
      item_id: itemId,
      quantidade,
      valor_unitario: valorUnitario,
      valor_total: valorTotal,
      lote_id: loteId,
      local_id: localId,
      observacao: observacao || undefined
    };

    setAjusteItens([...ajusteItens, newItem]);
    recalculateTotal([...ajusteItens, newItem]);
    resetItemForm();
  };

  const removeItem = (index: number) => {
    const newItens = ajusteItens.filter((_, i) => i !== index);
    setAjusteItens(newItens);
    recalculateTotal(newItens);
  };

  const recalculateTotal = (itens: CreateAjusteEstoqueItemDTO[]) => {
    const total = itens.reduce((sum, item) => sum + item.valor_total, 0);
    setValor(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!numero || !dataEntrada || !dataRegistro) {
      alert('Preencha número, data de entrada e data de registro');
      return;
    }

    if (ajusteItens.length === 0) {
      alert('Adicione pelo menos um item ao ajuste');
      return;
    }

    setLoading(true);
    try {
      const data = {
        numero,
        data_entrada: dataEntrada,
        data_registro: dataRegistro,
        tipo,
        valor,
        empresa_id: empresaId,
        itens: ajusteItens
      };

      if (editingId) {
        await ajusteEstoqueService.update(editingId, data as UpdateAjusteEstoqueDTO);
      } else {
        await ajusteEstoqueService.create(data as CreateAjusteEstoqueDTO);
      }

      await loadData();
      setIsFormOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar ajuste:', error);
      alert(error.response?.data?.detail || 'Erro ao salvar ajuste');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setLoading(true);
    try {
      await ajusteEstoqueService.delete(deletingId);
      await loadData();
      setDeleteModalOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Erro ao excluir ajuste:', error);
      alert('Erro ao excluir ajuste');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const getItemNome = (itemId: number) => {
    const item = itens.find(i => i.id === itemId);
    return item ? item.descricao : '-';
  };

  const getLoteNumero = (loteId: number | null | undefined) => {
    if (!loteId) return '-';
    const lote = lotes.find(l => l.id === loteId);
    return lote ? lote.codigo : '-';
  };

  const getLocalNome = (localId: number | null | undefined) => {
    if (!localId) return '-';
    const local = locais.find(l => l.id === localId);
    return local ? local.nome : '-';
  };

  return (
    <div className="ajuste-estoque-crud">
      <div className="header">
        <div>
          <h1>Ajustes de Estoque</h1>
          <p>Gerencie os ajustes de entrada e saída de estoque</p>
        </div>
        {!isFormOpen && (
          <button onClick={() => openForm()} className="btn-new">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Novo Ajuste
          </button>
        )}
      </div>

      <div className="content">
        {!isFormOpen ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Data Entrada</th>
                  <th>Data Registro</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Itens</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ajustes.map((ajuste) => (
                  <React.Fragment key={ajuste.id}>
                    <tr 
                      className={expandedRow === ajuste.id ? 'expanded' : ''}
                      style={{ cursor: 'pointer' }}
                    >
                      <td onClick={() => toggleExpandRow(ajuste.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 12 12" 
                            fill="none" 
                            stroke="currentColor"
                            style={{ 
                              transform: expandedRow === ajuste.id ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s'
                            }}
                          >
                            <path d="M4 2L8 6L4 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {ajuste.numero}
                        </div>
                      </td>
                      <td onClick={() => toggleExpandRow(ajuste.id)}>
                        {ajuste.data_entrada ? new Date(ajuste.data_entrada).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td onClick={() => toggleExpandRow(ajuste.id)}>
                        {new Date(ajuste.data_registro).toLocaleDateString('pt-BR')}
                      </td>
                      <td onClick={() => toggleExpandRow(ajuste.id)}>
                        <span className={ajuste.tipo === 'E' ? 'badge badge-success' : 'badge badge-danger'}>
                          {ajuste.tipo === 'E' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td onClick={() => toggleExpandRow(ajuste.id)}>
                        {ajuste.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td onClick={() => toggleExpandRow(ajuste.id)}>{ajuste.itens?.length || 0}</td>
                      <td>
                        <div className="actions">
                          <button
                            onClick={() => openForm(ajuste, true)}
                            className="btn-view"
                            title="Visualizar ajuste"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => openForm(ajuste)}
                            className="btn-edit"
                            title="Editar ajuste"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.33301 14.6667L2.66634 10.6667L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteModal(ajuste.id)}
                            className="btn-delete"
                            title="Excluir ajuste"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === ajuste.id && ajuste.itens && ajuste.itens.length > 0 && (
                      <tr className="expanded-row">
                        <td colSpan={7}>
                          <div className="items-detail">
                            <h4>Itens do Ajuste</h4>
                            <table className="items-table">
                              <thead>
                                <tr>
                                  <th>Código</th>
                                  <th>Item</th>
                                  <th>Lote</th>
                                  <th>Local</th>
                                  <th>Quantidade</th>
                                  <th>Valor Unit.</th>
                                  <th>Valor Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ajuste.itens.map((item) => (
                                  <tr key={item.id}>
                                    <td>{itens.find(i => i.id === item.item_id)?.codigo || '-'}</td>
                                    <td>{getItemNome(item.item_id)}</td>
                                    <td>{getLoteNumero(item.lote_id)}</td>
                                    <td>{getLocalNome(item.local_id)}</td>
                                    <td>{item.quantidade}</td>
                                    <td>{item.valor_unitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td>{item.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {ajustes.length === 0 && (
              <div className="empty-state">
                Nenhum ajuste cadastrado
              </div>
            )}
          </div>
        ) : (
          <div className="form-container">
            <div className="form-header">
              <h2>{isViewMode ? 'Visualizar Ajuste' : (editingId ? 'Editar Ajuste' : 'Novo Ajuste')}</h2>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="btn-close"
                title="Fechar"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Master Form */}
              <div className="form-row">
                <div className="form-group">
                  <label>Número <span className="required">*</span></label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div className="form-group">
                  <label>Data Entrada <span className="required">*</span></label>
                  <input
                    type="date"
                    value={dataEntrada}
                    onChange={(e) => setDataEntrada(e.target.value)}
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div className="form-group">
                  <label>Data Registro <span className="required">*</span></label>
                  <input
                    type="date"
                    value={dataRegistro}
                    onChange={(e) => setDataRegistro(e.target.value)}
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo <span className="required">*</span></label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as 'E' | 'S')}
                    required
                    disabled={isViewMode}
                  >
                    <option value="E">Entrada</option>
                    <option value="S">Saída</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Valor Total</label>
                  <input
                    type="text"
                    value={valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    readOnly
                    style={{ background: '#f3f4f6' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Itens do Ajuste</h3>

                {/* Item Input Form */}
                {!isViewMode && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <div className="form-group">
                    <label>Item <span className="required">*</span></label>
                    <select
                      value={itemId || ''}
                      onChange={(e) => setItemId(Number(e.target.value) || null)}
                    >
                      <option value="">Selecione...</option>
                      {itens.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.descricao}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantidade <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.001"
                      value={quantidade}
                      onChange={(e) => setQuantidade(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Valor Unit. <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      value={valorUnitario}
                      onChange={(e) => setValorUnitario(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Lote</label>
                    <select
                      value={loteId || ''}
                      onChange={(e) => setLoteId(Number(e.target.value) || null)}
                    >
                      <option value="">Nenhum</option>
                      {lotes.map((lote) => (
                        <option key={lote.id} value={lote.id}>
                          {lote.codigo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Local</label>
                    <select
                      value={localId || ''}
                      onChange={(e) => setLocalId(Number(e.target.value) || null)}
                    >
                      <option value="">Nenhum</option>
                      {locais.map((local) => (
                        <option key={local.id} value={local.id}>
                          {local.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Observação</label>
                    <input
                      type="text"
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      maxLength={500}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={addItem}
                      className="btn-submit"
                      style={{ width: '100%' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ marginRight: '0.5rem' }}>
                        <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Adicionar
                    </button>
                  </div>
                </div>
                )}

                {/* Items List */}
                <div className="items-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qtd</th>
                        <th>Vlr Unit.</th>
                        <th>Vlr Total</th>
                        <th>Lote</th>
                        <th>Local</th>
                        <th>Obs</th>
                        <th style={{ textAlign: 'right' }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ajusteItens.map((item, index) => (
                        <tr key={index}>
                          <td>{getItemNome(item.item_id)}</td>
                          <td>{item.quantidade}</td>
                          <td>
                            {item.valor_unitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td>
                            {item.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td>{getLoteNumero(item.lote_id)}</td>
                          <td>{getLocalNome(item.local_id)}</td>
                          <td>{item.observacao || '-'}</td>
                          <td>
                            {!isViewMode && (
                              <div className="actions">
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="btn-delete"
                                  title="Remover item"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ajusteItens.length === 0 && (
                    <div className="empty-state">
                      Nenhum item adicionado
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="btn-cancel"
                >
                  {isViewMode ? 'Fechar' : 'Cancelar'}
                </button>
                {!isViewMode && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-submit"
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <DeleteConfirmModal
          onCancel={() => {
            setDeleteModalOpen(false);
            setDeletingId(null);
          }}
          onConfirm={handleDelete}
          itemName={ajustes.find(a => a.id === deletingId)?.numero || ''}
        />
      )}

      <style jsx>{`
        .ajuste-estoque-crud {
          padding: 2rem;
          max-width: 90%;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          margin: 0 0 0.25rem 0;
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
        }

        .header p {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .btn-new {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #556b2f;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-new:hover {
          background: #6d8b3c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(85, 107, 47, 0.2);
        }

        .content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f9fafb;
        }

        th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e5e7eb;
        }

        tbody tr {
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.2s;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        tbody tr:last-child {
          border-bottom: none;
        }

        td {
          padding: 1rem;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 3rem 1rem;
          font-size: 0.875rem;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .btn-edit {
          padding: 0.5rem;
          background: #dbeafe;
          color: #1e40af;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-edit:hover {
          background: #bfdbfe;
        }

        .btn-view {
          padding: 0.5rem;
          background: #ddd6fe;
          color: #5b21b6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-view:hover {
          background: #c4b5fd;
        }

        .btn-delete {
          padding: 0.5rem;
          background: #fee2e2;
          color: #991b1b;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-delete:hover {
          background: #fecaca;
        }

        .form-container {
          padding: 2rem;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }

        .btn-close {
          padding: 0.5rem;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .btn-close:hover {
          background: #e5e7eb;
          color: #374151;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          font-size: 0.95rem;
        }

        .required {
          color: #dc2626;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
        }

        .items-table {
          margin-top: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .items-table table {
          background: white;
          border-radius: 6px;
          overflow: hidden;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-cancel {
          padding: 0.625rem 1.25rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-submit {
          padding: 0.625rem 1.25rem;
          background: #556b2f;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-submit:hover {
          background: #465a26;
        }

        .btn-submit:disabled,
        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .expanded-row {
          background: #fafbfc;
        }

        .expanded-row td {
          padding: 0;
        }

        .items-detail {
          padding: 1.5rem;
          background: #f9fafb;
          border-top: 2px solid #e5e7eb;
        }

        .items-detail h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .items-table table {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .items-table thead {
          background: #f3f4f6;
        }

        .items-table th {
          padding: 0.75rem;
          font-size: 0.813rem;
        }

        .items-table td {
          padding: 0.75rem;
          font-size: 0.813rem;
        }

        @media (max-width: 768px) {
          .ajuste-estoque-crud {
            padding: 1rem;
            max-width: 100%;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header h1 {
            font-size: 1.5rem;
          }

          .btn-new {
            width: 100%;
            justify-content: center;
          }

          .form-container {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }

          .table-wrapper {
            overflow-x: scroll;
          }

          table {
            min-width: 600px;
          }
        }
      `}</style>
    </div>
  );
};

export default AjusteEstoqueCRUD;