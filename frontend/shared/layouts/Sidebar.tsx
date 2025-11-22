import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Dropdown from '../ui/Dropdown'

const items = [{ href: '/', label: 'Home' }]

export default function Sidebar(): JSX.Element {
  const router = useRouter()

  return (
    <header className="sidebar top-nav">
      <div className="brand">eZion</div>

      <nav className="nav">
        {items.map((it) => (
          <Link key={it.label} href={it.href} className={`nav-item ${router.pathname === it.href ? 'active' : ''}`}>
            {it.label}
          </Link>
        ))}

        <Dropdown
          label="Contábil"
          href="/contabil"
          items={[
            { href: '/contabil/empresas', label: 'Empresas' },
          ]}
          className={`${router.pathname.startsWith('/contabil') ? 'active' : ''}`}
        />

        <Dropdown
          label="Vendas"
          href="/vendas"
          items={[
            { href: '/vendas/clientes', label: 'Clientes' },
            { href: '/vendas/pedidos', label: 'Pedidos' },
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
