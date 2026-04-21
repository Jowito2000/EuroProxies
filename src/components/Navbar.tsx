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
          <Link href="/editor" className="navbar-link flex items-center gap-2">
            <img src="/icons/Add.svg" alt="" className="w-5 h-5" />
            Subir cartas
          </Link>
          <Link href="/cart" className="navbar-link relative flex items-center gap-2">
            <img src="/icons/ShoppingCart.svg" alt="" className="w-5 h-5" />
            Carrito
            {mounted && totalCards > 0 && (
              <span className="cart-badge">{totalCards}</span>
            )}
          </Link>

          {mounted && user ? (
            <div className="flex items-center gap-4 ml-2 pl-4 border-l border-white/10">
              <Link href="/orders" className="navbar-link">
                Mis pedidos
              </Link>
              <span className="text-sm opacity-60 ml-2">{user.email}</span>
              <form action={logout}>
                <button type="submit" className="navbar-link flex items-center gap-2 text-sm" style={{ color: 'var(--color-danger, #ef4444)' }}>
                  Cerrar sesión
                </button>
              </form>
            </div>
          ) : (
            mounted && (
              <Link href="/login" className="navbar-link flex items-center gap-2 ml-2 pl-4 border-l border-white/10" style={{ color: 'var(--color-primary)' }}>
                <img src="/icons/Login.svg" alt="" className="w-5 h-5" />
                Iniciar sesión
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  )
}
