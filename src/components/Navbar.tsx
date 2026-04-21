'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cartStore'
import { useAuth } from './AuthProvider'
import { logout } from '@/app/actions/auth'

export default function Navbar() {
  const totalCards = useCartStore(s => s.totalCards())
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { user } = useAuth()

  return (
    <header className="navbar-glass">
      <div className="navbar-watermark" aria-hidden="true">
        <img src="/favicon.png" alt="" />
      </div>
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between" style={{ position: 'relative', zIndex: 1 }}>
        <Link href="/" className="navbar-logo">
          EuroProxy
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/editor" className="navbar-link">
            Subir cartas
          </Link>
          <Link href="/cart" className="navbar-link relative flex items-center gap-2">
            Carrito
            {mounted && totalCards > 0 && (
              <span className="cart-badge">{totalCards}</span>
            )}
          </Link>

          {mounted && user ? (
            <>
              <Link href="/orders" className="navbar-link">
                Mis pedidos
              </Link>
              <form action={logout}>
                <button type="submit" className="navbar-link text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Salir
                </button>
              </form>
            </>
          ) : (
            mounted && (
              <Link href="/login" className="navbar-link" style={{ color: 'var(--color-primary)' }}>
                Iniciar sesión
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  )
}
