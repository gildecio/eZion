import React from 'react'

interface TopbarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export default function Topbar({ collapsed, onToggle }: TopbarProps) {
  return (
    <header className="topbar">
      <button className="btn-toggle" onClick={onToggle} aria-label="Toggle sidebar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
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
