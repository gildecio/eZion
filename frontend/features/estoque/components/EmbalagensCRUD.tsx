import { useState, useEffect } from 'react';
import { useEmbalagens } from '../hooks';
import { useItens } from '../hooks';
import { DeleteConfirmModal } from '@/shared/components';
import type { EmbalagemItem, CreateEmbalagemItemDTO, UpdateEmbalagemItemDTO } from '../types';
import { useUnidades } from '../hooks';

export default function EmbalagensCRUD() {
  const { itens, loading: loadingItens } = useItens();
  const { unidades, loading: loadingUnidades } = useUnidades();
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const { embalagens, loading, error, create, update, remove } = useEmbalagens(selectedItemId || undefined);
  const [filtroItem, setFiltroItem] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingEmbalagem, setEditingEmbalagem] = useState<EmbalagemItem | null>(null);
  const [deletingEmbalagem, setDeletingEmbalagem] = useState<EmbalagemItem | null>(null);
  const [formData, setFormData] = useState<CreateEmbalagemItemDTO>({
    item_id: 0,
    unidade_id: 0,
    descricao: '',
    fator_conversao: 1,
    codigo_barras: null,
    padrao: false,
  });

  const handleCreate = () => {
    if (!selectedItemId) {
      alert('Selecione um item primeiro');
      return;
    }
    setEditingEmbalagem(null);
    setFormData({
      item_id: selectedItemId,
      unidade_id: 0,
      descricao: '',
      fator_conversao: 1,
      codigo_barras: null,
      padrao: false,
    });
    setShowForm(true);
  };

  const handleEdit = (embalagem: EmbalagemItem) => {
    setEditingEmbalagem(embalagem);
    setFormData({
      item_id: embalagem.item_id,
      unidade_id: embalagem.unidade_id,
      descricao: embalagem.descricao,
      fator_conversao: Number(embalagem.fator_conversao),
      codigo_barras: embalagem.codigo_barras,
      padrao: embalagem.padrao,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.unidade_id === 0) {
      alert('Selecione uma unidade');
      return;
    }

    const success = editingEmbalagem
      ? await update(editingEmbalagem.id, formData)
      : await create(formData);

    if (success) {
      setShowForm(false);
      setEditingEmbalagem(null);
      setFormData({
        item_id: selectedItemId || 0,
        unidade_id: 0,
        descricao: '',
        fator_conversao: 1,
        codigo_barras: null,
        padrao: false,
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingEmbalagem) return;
    
    const success = await remove(deletingEmbalagem.id);
    if (success) {
      setDeletingEmbalagem(null);
    }
  };

  const selectedItem = itens.find(i => i.id === selectedItemId);

  // Filtrar unidades compatíveis com a unidade padrão do item
  const unidadesCompativeis = unidades.filter(unidade => {
    if (!selectedItem || !selectedItem.unidade_padrao_id) {
      return true; // Se item não tem unidade padrão, mostra todas
    }
    
    const unidadePadrao = unidades.find(u => u.id === selectedItem.unidade_padrao_id);
    if (!unidadePadrao) return true;
    
    // Só mostra unidades do mesmo tipo de medida
    return unidade.tipo_medida === unidadePadrao.tipo_medida;
  });

  // Filtrar itens baseado no texto de busca
  const itensFiltrados = itens.filter(item => {
    if (!filtroItem) return true;
    const searchTerm = filtroItem.toLowerCase();
    return (
      item.descricao.toLowerCase().includes(searchTerm) ||
      item.tipo.toLowerCase().includes(searchTerm) ||
      item.id.toString().includes(searchTerm)
    );
  });

  return (
    <div className="embalagens-crud">
      <div className="header">
        <div>
          <h1>Embalagens</h1>
          <p>Gerencie as embalagens dos itens de estoque</p>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="two-columns">
        {/* Coluna Esquerda - Seleção de Item */}
        <div className="column">
          <div className="content">
            <div className="content-header">
              <h2>Selecione um Item</h2>
            </div>
            <div className="filter-container">
              <input
                type="text"
                placeholder="Filtrar por descrição, tipo ou ID..."
                value={filtroItem}
                onChange={(e) => setFiltroItem(e.target.value)}
                className="filter-input"
              />
              {filtroItem && (
                <button
                  onClick={() => setFiltroItem('')}
                  className="clear-filter"
                  title="Limpar filtro"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {loadingItens ? (
              <div className="loading">Carregando itens...</div>
            ) : (
              <div className="items-list">
                {itensFiltrados.length === 0 ? (
                  <div className="empty">
                    {filtroItem ? 'Nenhum item encontrado com esse filtro' : 'Nenhum item cadastrado'}
                  </div>
                ) : (
                  itensFiltrados.map((item) => (
                    <div
                      key={item.id}
                      className={`item-card ${selectedItemId === item.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setShowForm(false);
                      }}
                    >
                      <div className="item-id">#{item.id}</div>
                      <div className="item-descricao">{item.descricao}</div>
                      <div className="item-tipo">{item.tipo}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita - Embalagens do Item */}
        <div className="column">
          {selectedItemId ? (
            <>
              <div className="content">
                <div className="content-header">
                  <div>
                    <h2>Embalagens</h2>
                    {selectedItem && (
                      <p className="selected-item-name">{selectedItem.descricao}</p>
                    )}
                  </div>
                  {!showForm && (
                    <button onClick={handleCreate} className="btn-new">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Cadastrar
                    </button>
                  )}
                </div>

                {showForm ? (
                  <div className="form-container">
                    <div className="form-header">
                      <h3>{editingEmbalagem ? 'Editar Embalagem' : 'Nova Embalagem'}</h3>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditingEmbalagem(null);
                        }}
                        className="btn-close"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="unidade_id">Unidade *</label>
                        <select
                          id="unidade_id"
                          value={formData.unidade_id}
                          onChange={(e) => setFormData({ ...formData, unidade_id: Number(e.target.value) })}
                          required
                          disabled={loadingUnidades}
                        >
                          <option value={0}>Selecione uma unidade</option>
                          {unidadesCompativeis.map((unidade) => (
                            <option key={unidade.id} value={unidade.id}>
                              {unidade.sigla} - {unidade.descricao} ({unidade.tipo_medida})
                            </option>
                          ))}
                        </select>
                        {selectedItem && selectedItem.unidade_padrao_id && (
                          <small>
                            Apenas unidades do tipo {unidades.find(u => u.id === selectedItem.unidade_padrao_id)?.tipo_medida} são permitidas
                          </small>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="descricao">Descrição *</label>
                        <input
                          id="descricao"
                          type="text"
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                          maxLength={100}
                          required
                          placeholder="Ex: Caixa com 12 unidades"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="fator_conversao">Fator de Conversão *</label>
                        <input
                          id="fator_conversao"
                          type="number"
                          step="0.000001"
                          value={formData.fator_conversao}
                          onChange={(e) => setFormData({ ...formData, fator_conversao: Number(e.target.value) })}
                          required
                          placeholder="Ex: 12 (para caixa com 12 unidades)"
                        />
                        <small>Quantidade da unidade padrão do item nesta embalagem</small>
                      </div>

                      <div className="form-group">
                        <label htmlFor="codigo_barras">Código de Barras</label>
                        <input
                          id="codigo_barras"
                          type="text"
                          value={formData.codigo_barras || ''}
                          onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value || null })}
                          maxLength={50}
                          placeholder="EAN, ISBN, etc"
                        />
                      </div>

                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={formData.padrao}
                            onChange={(e) => setFormData({ ...formData, padrao: e.target.checked })}
                          />
                          <span>Embalagem padrão</span>
                        </label>
                        <small>Apenas uma embalagem pode ser padrão por item</small>
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false);
                            setEditingEmbalagem(null);
                          }}
                          className="btn-cancel"
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn-submit">
                          {editingEmbalagem ? 'Atualizar' : 'Cadastrar'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    {loading ? (
                      <div className="loading">Carregando embalagens...</div>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Unidade</th>
                            <th>Descrição</th>
                            <th>Fator</th>
                            <th>Código Barras</th>
                            <th>Padrão</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {embalagens.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="empty">
                                Nenhuma embalagem cadastrada para este item
                              </td>
                            </tr>
                          ) : (
                            embalagens.map((embalagem) => (
                              <tr key={embalagem.id}>
                                <td>{embalagem.id}</td>
                                <td>
                                  <span className="badge-unidade">
                                    {'unidade_sigla' in embalagem ? embalagem.unidade_sigla : ''}
                                  </span>
                                </td>
                                <td>{embalagem.descricao}</td>
                                <td>{embalagem.fator_conversao}</td>
                                <td>{embalagem.codigo_barras || '-'}</td>
                                <td>
                                  {embalagem.padrao ? (
                                    <span className="badge-padrao">Sim</span>
                                  ) : (
                                    <span className="badge-nao-padrao">Não</span>
                                  )}
                                </td>
                                <td className="actions">
                                  <button
                                    onClick={() => handleEdit(embalagem)}
                                    className="btn-edit"
                                    title="Editar"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setDeletingEmbalagem(embalagem)}
                                    className="btn-delete"
                                    title="Excluir"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                      <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="3 6 5 6 21 6" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="content empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <p>Selecione um item ao lado para gerenciar suas embalagens</p>
            </div>
          )}
        </div>
      </div>

      {deletingEmbalagem && (
        <DeleteConfirmModal
          itemName={`${deletingEmbalagem.descricao}`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingEmbalagem(null)}
        />
      )}

      <style jsx>{`
        .embalagens-crud {
          padding: 2rem;
          height: 100%;
        }

        .header {
          margin-bottom: 2rem;
        }

        .header h1 {
          margin: 0;
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
        }

        .header p {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #991b1b;
          margin-bottom: 1.5rem;
        }

        .two-columns {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 1.5rem;
          height: calc(100vh - 200px);
        }

        .column {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .content-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .content-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .selected-item-name {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .filter-container {
          padding: 0 1.5rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          position: relative;
        }

        .filter-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .filter-input:focus {
          outline: none;
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
        }

        .filter-input::placeholder {
          color: #9ca3af;
        }

        .clear-filter {
          position: absolute;
          right: 2rem;
          top: 0.75rem;
          padding: 0.25rem;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clear-filter:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .items-list {
          overflow-y: auto;
          flex: 1;
          padding: 1rem;
        }

        .item-card {
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .item-card:hover {
          border-color: #556b2f;
          background: #f9fafb;
        }

        .item-card.selected {
          border-color: #556b2f;
          background: #f0f4e8;
        }

        .item-id {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .item-descricao {
          font-weight: 500;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .item-tipo {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .btn-new {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: #556b2f;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-new:hover {
          background: #6d8b3c;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty {
          text-align: center;
          color: #9ca3af;
          padding: 2rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
        }

        .empty-state svg {
          margin-bottom: 1rem;
        }

        .empty-state p {
          margin: 0;
          font-size: 1rem;
        }

        .table-wrapper {
          overflow: auto;
          flex: 1;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f9fafb;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #e5e7eb;
        }

        td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        .badge-unidade {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badge-padrao {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #d1fae5;
          color: #065f46;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badge-nao-padrao {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit,
        .btn-delete {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-edit {
          background: #dbeafe;
          color: #1e40af;
        }

        .btn-edit:hover {
          background: #bfdbfe;
        }

        .btn-delete {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-delete:hover {
          background: #fecaca;
        }

        .form-container {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .form-header h3 {
          margin: 0;
          font-size: 1.125rem;
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

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-group {
          flex-direction: row;
          align-items: center;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
        }

        label {
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }

        input,
        select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #556b2f;
          box-shadow: 0 0 0 3px rgba(85, 107, 47, 0.1);
        }

        small {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .btn-cancel,
        .btn-submit {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-submit {
          background: #556b2f;
          color: white;
        }

        .btn-submit:hover {
          background: #6d8b3c;
        }

        @media (max-width: 1024px) {
          .two-columns {
            grid-template-columns: 1fr;
            height: auto;
          }

          .column {
            height: 500px;
          }
        }

        @media (max-width: 768px) {
          .embalagens-crud {
            padding: 1rem;
          }

          .column {
            height: 400px;
          }
        }
      `}</style>
    </div>
  );
}
