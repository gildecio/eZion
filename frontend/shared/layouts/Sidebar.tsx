import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Dropdown from '../ui/Dropdown'

const items = [{ 
  href: '/', 
  label: 'Home',
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}]

export default function Sidebar() {
  const router = useRouter()

  return (
    <header className="sidebar top-nav">
      <div className="brand">eZion</div>

      <nav className="nav">
        {items.map((it) => (
          <Link key={it.label} href={it.href} className={`nav-item ${router.pathname === it.href ? 'active' : ''}`}>
            {it.icon}
            <span>{it.label}</span>
          </Link>
        ))}

        <Dropdown
          label="Contábil"
          href="/contabil"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          items={[
            { href: '/contabil/empresas', label: 'Empresas', icon: 'building' },
          ]}
          className={`${router.pathname.startsWith('/contabil') ? 'active' : ''}`}
        />

        <Dropdown
          label="Estoque"
          href="/estoque"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          items={[
            { href: '/estoque/itens', label: 'Itens', icon: 'tag' },
            { href: '/estoque/grupos', label: 'Grupos', icon: 'folder' },
            { href: '/estoque/unidades', label: 'Unidades', icon: 'scale' },
            { href: '/estoque/embalagens', label: 'Embalagens', icon: 'package' },
            { href: '/estoque/locais', label: 'Locais', icon: 'location' },
            { href: '/estoque/lotes', label: 'Lotes', icon: 'clipboard' },
            { href: '/estoque/movimentacoes', label: 'Movimentações', icon: 'arrows' },
            { href: '/estoque/saldos', label: 'Saldos', icon: 'chart' },
          ]}
          className={`${router.pathname.startsWith('/estoque') ? 'active' : ''}`}
        />

        <Dropdown
          label="Vendas"
          href="/vendas"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          items={[
            { href: '/vendas/clientes', label: 'Clientes', icon: 'users' },
            { href: '/vendas/pedidos', label: 'Pedidos', icon: 'receipt' },
          ]}
          className={`${router.pathname.startsWith('/vendas') ? 'active' : ''}`}
        />
      </nav>

      <div className="top-nav-actions">
        <div className="user">
          <div className="avatar">EZ</div>
          <div className="user-info">
            <div className="user-name">Gildecio</div>
          </div>
        </div>
      </div>
    </header>
  )
}
