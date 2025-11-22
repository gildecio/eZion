import React from 'react'

interface TopbarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export default function Topbar({ collapsed, onToggle }: TopbarProps): JSX.Element {
  return (
    <header className="topbar">
      <button className="btn-toggle" onClick={onToggle} aria-label="Toggle sidebar">
        ☰
      </button>
      <div className="topbar-actions">
        <input className="search" placeholder="Pesquisar..." />
        <div className="user">
          <div className="avatar">EZ</div>
          <div className="user-info">
            <div className="user-name">Gildecio</div>
            <div className="user-role muted">Administrador</div>
          </div>
        </div>
      </div>
    </header>
  )
}
