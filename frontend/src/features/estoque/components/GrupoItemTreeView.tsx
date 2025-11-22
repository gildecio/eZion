import type { GrupoItemTree } from '../types/grupo-item';

interface GrupoItemTreeViewProps {
  nodes: GrupoItemTree[];
  onEdit: (grupo: GrupoItemTree) => void;
  onDelete: (grupo: GrupoItemTree) => void;
  onNodeClick?: (grupo: GrupoItemTree) => void;
  selectedId?: number | null;
}

const TreeNode = ({ 
  node, 
  level, 
  onEdit, 
  onDelete,
  onNodeClick,
  selectedId
}: { 
  node: GrupoItemTree; 
  level: number;
  onEdit: (grupo: GrupoItemTree) => void;
  onDelete: (grupo: GrupoItemTree) => void;
  onNodeClick?: (grupo: GrupoItemTree) => void;
  selectedId?: number | null;
}) => {
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <>
      <tr 
        className={`tree-row ${selectedId === node.id ? 'selected' : ''}`}
        onClick={() => onNodeClick?.(node)}
        style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
      >
        <td className="name-cell">
          <span className="indent" style={{ width: `${level * 24}px` }} />
          {hasChildren && <span className="folder-icon">📁</span>}
          {!hasChildren && <span className="file-icon">📄</span>}
          <span className="name">{node.nome}</span>
        </td>
        <td className="level-cell">{level}</td>
        <td className="leaf-cell">
          {node.is_leaf ? (
            <span className="badge badge-yes">Sim</span>
          ) : (
            <span className="badge badge-no">Não</span>
          )}
        </td>
        <td className="items-cell">{node.children.length}</td>
        <td className="actions-cell">
          <button onClick={() => onEdit(node)} className="btn-edit" title="Editar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button onClick={() => onDelete(node)} className="btn-delete" title="Excluir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </td>
      </tr>
      
      {hasChildren && node.children.map((child) => (
        <TreeNode 
          key={child.id} 
          node={child} 
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onNodeClick={onNodeClick}
          selectedId={selectedId}
        />
      ))}

      <style jsx>{`
        .tree-row {
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.15s;
        }

        .tree-row:hover {
          background: #f9fafb;
        }

        .tree-row.selected {
          background: #f0f9ff;
          border-left: 3px solid #556b2f;
        }

        .tree-row.selected:hover {
          background: #e0f2fe;
        }

        .name-cell {
          padding: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 40%;
        }

        .indent {
          display: inline-block;
        }

        .folder-icon,
        .file-icon {
          font-size: 1.125rem;
          flex-shrink: 0;
        }

        .name {
          color: #1f2937;
          font-weight: 500;
        }

        .level-cell,
        .leaf-cell,
        .items-cell {
          padding: 0.75rem;
          text-align: center;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .badge-yes {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-no {
          background: #fee2e2;
          color: #991b1b;
        }

        .actions-cell {
          padding: 0.75rem;
          text-align: center;
          width: 120px;
        }

        .btn-edit,
        .btn-delete {
          border: none;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          margin: 0 0.25rem;
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
      `}</style>
    </>
  );
};

export const GrupoItemTreeView = ({ nodes, onEdit, onDelete, onNodeClick, selectedId }: GrupoItemTreeViewProps) => {
  return (
    <div className="tree-container">
      <table className="tree-table">
        <thead>
          <tr>
            <th className="th-name">Nome</th>
            <th className="th-level">Nível</th>
            <th className="th-leaf">Folha</th>
            <th className="th-children">Subgrupos</th>
            <th className="th-actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          {nodes.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-message">
                Nenhum grupo cadastrado
              </td>
            </tr>
          ) : (
            nodes.map((node) => (
              <TreeNode 
                key={node.id} 
                node={node} 
                level={0}
                onEdit={onEdit}
                onDelete={onDelete}
                onNodeClick={onNodeClick}
                selectedId={selectedId}
              />
            ))
          )}
        </tbody>
      </table>

      <style jsx>{`
        .tree-container {
          overflow-x: auto;
        }

        .tree-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          min-width: 800px;
        }

        .tree-table thead {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .tree-table th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .th-level,
        .th-leaf,
        .th-children,
        .th-actions {
          text-align: center;
        }

        .th-name {
          width: 40%;
        }

        .th-level {
          width: 10%;
        }

        .th-leaf {
          width: 15%;
        }

        .th-children {
          width: 15%;
        }

        .th-actions {
          width: 120px;
        }

        .empty-message {
          padding: 3rem;
          text-align: center;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};
