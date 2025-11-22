import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type DropdownItem = { href?: string; label: string; items?: DropdownItem[] }

interface DropdownProps {
  label: string
  href?: string
  items?: DropdownItem[]
  className?: string
}

const Dropdown: React.FC<DropdownProps> = ({ label, href, items = [], className = '' }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!(e.target instanceof Node)) return
      if (!ref.current.contains(e.target)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  return (
    <div ref={ref} className={`nav-item has-dropdown ${open ? 'open' : ''} ${className}`}>
      <div className="nav-link-wrap">
        {items && items.length > 0 ? (
          <button
            type="button"
            className="nav-link nav-link-toggle"
            aria-expanded={open}
            aria-haspopup="true"
            onClick={(e) => {
              e.stopPropagation()
              setOpen((s) => !s)
            }}
          >
            {label}
          </button>
        ) : (
          href ? (
            <Link href={href} className="nav-link">
              {label}
            </Link>
          ) : (
            <span className="nav-link">{label}</span>
          )
        )}
      </div>

      <div className="dropdown-menu" role="menu">
        {items.map((it) =>
          it.items ? (
            <div key={it.label} className="dropdown-item has-submenu">
              <Dropdown label={it.label} href={it.href} items={it.items} className="submenu" />
            </div>
          ) : (
            <Link key={it.label} href={it.href ?? '#'} className={`dropdown-item`} onClick={() => setOpen(false)}>
              {it.label}
            </Link>
          )
        )}
      </div>
    </div>
  )
}

export default Dropdown
