import { useState } from 'react';
import { useEmbalagensCatalogo, useUnidades } from '../hooks';
import { DeleteConfirmModal } from '@/shared/components';
import type { EmbalagemCatalogo, CreateEmbalagemCatalogoDTO, UpdateEmbalagemCatalogoDTO } from '../types/embalagem';

export default function EmbalagensCRUD() {
  const { embalagens, loading, error, create, update, remove } = useEmbalagensCatalogo();
  const { unidades, loading: loadingUnidades } = useUnidades();
  const [filtro, setFiltro] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmbalagemCatalogo | null>(null);
  const [deleting, setDeleting] = useState<EmbalagemCatalogo | null>(null);
  const [formData, setFormData] = useState<CreateEmbalagemCatalogoDTO>({ descricao: '', unidade_id: 0, ativo: true });

  const filtered = embalagens.filter(e => {
    if (!filtro) return true;
    const t = filtro.toLowerCase();
    return e.descricao.toLowerCase().includes(t) || e.id.toString() === t;
  });

  const startCreate = () => {
    setEditing(null);
    setFormData({ descricao: '', unidade_id: 0, ativo: true });
    setShowForm(true);
  };

  const startEdit = (emb: EmbalagemCatalogo) => {
    setEditing(emb);
    setFormData({ descricao: emb.descricao, unidade_id: emb.unidade_id, ativo: emb.ativo });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.unidade_id === 0) {
      alert('Selecione a unidade');
      return;
    }
    let success = false;
    if (editing) {
      const dto: UpdateEmbalagemCatalogoDTO = { descricao: formData.descricao, unidade_id: formData.unidade_id, ativo: formData.ativo };
      success = await update(editing.id, dto);
    } else {
      success = await create(formData);
    }
    if (success) {
      setShowForm(false);
      setEditing(null);
      setFormData({ descricao: '', unidade_id: 0, ativo: true });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const ok = await remove(deleting.id);
    if (ok) setDeleting(null);
  };

  return (
    <div className="embalagens-crud">
      <div className="header">
        <div>
          <h1>Catálogo de Embalagens</h1>
          <p>CRUD independente (não vinculado a itens)</p>
        </div>
        {!showForm && (
          <button onClick={startCreate} className="btn-new">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Cadastrar
          </button>
        )}
      </div>

      {error && (
        <div className="error-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="content">
        <div className="filter-container">
          <input
            type="text"
            placeholder="Filtrar por descrição ou ID..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="filter-input"
          />
          {filtro && (
            <button className="clear-filter" onClick={() => setFiltro('')} title="Limpar filtro">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {showForm ? (
          <div className="form-container">
            <div className="form-header">
              <h3>{editing ? 'Editar Embalagem' : 'Nova Embalagem'}</h3>
              <button className="btn-close" onClick={() => { setShowForm(false); setEditing(null); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="descricao">Descrição *</label>
                <input
                  id="descricao"
                  type="text"
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  maxLength={100}
                  required
                  placeholder="Ex: Caixa com 12 unidades"
                />
              </div>
              <div className="form-group">
                <label htmlFor="unidade">Unidade *</label>
                <select
                  id="unidade"
                  value={formData.unidade_id}
                  onChange={e => setFormData({ ...formData, unidade_id: Number(e.target.value) })}
                  required
                  disabled={loadingUnidades}
                >
                  <option value={0}>Selecione</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.sigla} - {u.descricao}</option>
                  ))}
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                  />
                  <span>Ativo</span>
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowForm(false); setEditing(null); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editing ? 'Atualizar' : 'Cadastrar'}
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
                    <th>Descrição</th>
                    <th>Unidade</th>
                    <th>Ativo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty">Nenhuma embalagem cadastrada</td>
                    </tr>
                  ) : (
                    filtered.map(e => (
                      <tr key={e.id}>
                        <td>{e.id}</td>
                        <td>{e.descricao}</td>
                        <td>{unidades.find(u => u.id === e.unidade_id)?.sigla || e.unidade_id}</td>
                        <td>{e.ativo ? <span className="badge-padrao">Sim</span> : <span className="badge-nao-padrao">Não</span>}</td>
                        <td className="actions">
                          <button className="btn-edit" onClick={() => startEdit(e)} title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="btn-delete" onClick={() => setDeleting(e)} title="Excluir">
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

      {deleting && (
        <DeleteConfirmModal
          itemName={deleting.descricao}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      <style jsx>{`
        .embalagens-crud { padding: 2rem; height: 100%; }
        .header { margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { margin: 0; font-size: 1.6rem; font-weight: 700; color: #111827; }
        .header p { margin: 0.25rem 0 0; font-size: 0.85rem; color: #6b7280; }
        .error-alert { display:flex; align-items:center; gap:.75rem; padding:1rem 1.25rem; background:#fee2e2; border:1px solid #fecaca; border-radius:8px; color:#991b1b; margin-bottom:1rem; }
        .content { background:#fff; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.1); display:flex; flex-direction:column; height:calc(100vh - 200px); }
        .filter-container { padding:1rem 1.5rem; border-bottom:1px solid #e5e7eb; position:relative; }
        .filter-input { width:100%; padding:.75rem 2.5rem .75rem .75rem; border:1px solid #d1d5db; border-radius:6px; font-size:.85rem; }
        .filter-input:focus { outline:none; border-color:#556b2f; box-shadow:0 0 0 3px rgba(85,107,47,.1); }
        .clear-filter { position:absolute; right:1.75rem; top:1.05rem; padding:.25rem; background:transparent; border:none; border-radius:4px; cursor:pointer; color:#6b7280; }
        .clear-filter:hover { background:#f3f4f6; color:#374151; }
        .table-wrapper { overflow:auto; flex:1; }
        table { width:100%; border-collapse:collapse; }
        thead { background:#f9fafb; position:sticky; top:0; z-index:1; }
        th { padding:.75rem 1rem; text-align:left; font-weight:600; color:#374151; font-size:.75rem; text-transform:uppercase; letter-spacing:.05em; border-bottom:2px solid #e5e7eb; }
        td { padding:.75rem 1rem; border-bottom:1px solid #e5e7eb; font-size:.875rem; }
        tbody tr:hover { background:#f9fafb; }
        .actions { display:flex; gap:.5rem; }
        .btn-new { display:flex; align-items:center; gap:.5rem; padding:.6rem 1rem; background:#556b2f; color:#fff; border:none; border-radius:6px; font-size:.85rem; cursor:pointer; }
        .btn-new:hover { background:#6d8b3c; }
        .btn-edit, .btn-delete { padding:.5rem; border:none; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .btn-edit { background:#dbeafe; color:#1e40af; }
        .btn-edit:hover { background:#bfdbfe; }
        .btn-delete { background:#fee2e2; color:#991b1b; }
        .btn-delete:hover { background:#fecaca; }
        .badge-padrao { display:inline-block; padding:.25rem .6rem; background:#d1fae5; color:#065f46; border-radius:12px; font-size:.7rem; font-weight:600; }
        .badge-nao-padrao { display:inline-block; padding:.25rem .6rem; background:#f3f4f6; color:#6b7280; border-radius:12px; font-size:.7rem; font-weight:600; }
        .form-container { padding:1.5rem; overflow-y:auto; flex:1; }
        .form-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
        .form-header h3 { margin:0; font-size:1.05rem; font-weight:600; }
        form { display:flex; flex-direction:column; gap:1.1rem; }
        .form-group { display:flex; flex-direction:column; gap:.5rem; }
        label { font-weight:500; font-size:.8rem; color:#374151; }
        input, select { padding:.7rem; border:1px solid #d1d5db; border-radius:6px; font-size:.85rem; }
        input:focus, select:focus { outline:none; border-color:#556b2f; box-shadow:0 0 0 3px rgba(85,107,47,.1); }
        .checkbox-group { flex-direction:row; align-items:center; }
        .checkbox-group label { flex-direction:row; }
        .form-actions { display:flex; gap:.75rem; justify-content:flex-end; }
        .btn-cancel, .btn-submit { padding:.65rem 1.3rem; border:none; border-radius:6px; font-size:.85rem; font-weight:500; cursor:pointer; }
        .btn-cancel { background:#f3f4f6; color:#374151; }
        .btn-cancel:hover { background:#e5e7eb; }
        .btn-submit { background:#556b2f; color:#fff; }
        .btn-submit:hover { background:#6d8b3c; }
        .loading { text-align:center; padding:2rem; color:#6b7280; }
        .empty { text-align:center; padding:2rem; color:#9ca3af; }
        @media (max-width: 900px){ .content { height:auto; } }
      `}</style>
    </div>
  );
}
