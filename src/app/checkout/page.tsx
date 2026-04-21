'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/cartStore'
import PriceCalculator from '@/components/PriceCalculator'

export default function CheckoutPage() {
  const router = useRouter()
  const cards = useCartStore(s => s.cards)
  const shippingCountry = useCartStore(s => s.shippingCountry)
  const subtotal = useCartStore(s => s.subtotal())
  const shippingCost = useCartStore(s => s.shippingCost())
  const total = useCartStore(s => s.total())
  const clearCart = useCartStore(s => s.clearCart)
  const totalCards = useCartStore(s => s.totalCards())

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && cards.length === 0) {
      router.replace('/cart')
    }
  }, [mounted, cards.length, router])

  if (!mounted || cards.length === 0) {
    return null
  }

  const handlePay = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: cards.map(c => ({ id: c.id, imageUrl: c.imageUrl, name: c.name, game: c.game, quantity: c.quantity, finish: c.finish })),
          shippingCountry, subtotal, shippingCost, total,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al iniciar el pago')
      clearCart()
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="section-tag mb-3">Checkout</div>
        <h1 className="section-title">Confirmar pedido</h1>
      </div>

      {/* Legal notice */}
      <div
        className="rounded-xl p-4 mb-8"
        style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.3)' }}
      >
        <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-accent)' }}>⚠ AVISO LEGAL IMPORTANTE</p>
        <p className="text-sm" style={{ color: 'rgba(245,158,11,0.8)' }}>
          Los productos que estás adquiriendo son PROXIES no oficiales. No están afiliadas ni aprobadas por los editores.
          Son para uso casual y testing de decks únicamente. No válidas para torneos oficiales.
        </p>
      </div>

      {/* Card summary */}
      <div className="surface-card p-5 mb-6">
        <h2 className="font-bold mb-4" style={{ color: '#fff' }}>
          Resumen — {totalCards} carta{totalCards !== 1 ? 's' : ''}
        </h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {cards.map(card => (
            <div key={card.id} className="flex justify-between text-sm py-1"
              style={{ borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>
                {card.name ?? 'Carta'} · {card.game.toUpperCase()}
              </span>
              <span className="font-semibold ml-4" style={{ color: '#fff' }}>×{card.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <PriceCalculator />
      </div>

      {error && (
        <div className="danger-toast mb-4">⚠ {error}</div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="btn-primary w-full py-4 text-lg font-bold"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="inline-block w-5 h-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
            Redirigiendo a Stripe...
          </span>
        ) : (
          `Pagar ${total.toFixed(2)} € con Stripe →`
        )}
      </button>

      <p className="text-xs text-center mt-3" style={{ color: 'var(--color-text-muted)' }}>
        🔒 Pago seguro con Stripe · También disponible PayPal
      </p>
    </div>
  )
}
