'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cartStore'
import { getPricePerCard, PRICE_TIERS } from '@/lib/pricing'

export default function PriceCalculator() {
  const [hasHydrated, setHasHydrated] = useState(false)
  const totalCards = useCartStore(s => s.totalCards())
  const subtotal = useCartStore(s => s.subtotal())
  const shippingCost = useCartStore(s => s.shippingCost())
  const total = useCartStore(s => s.total())
  const pricePerCard = getPricePerCard(totalCards)

  useEffect(() => {
    setHasHydrated(true)
  }, [])

  if (!hasHydrated) {
    return <div className="price-panel animate-pulse bg-surface-2" style={{ height: 200, borderRadius: 16 }}></div>
  }

  if (totalCards === 0) return null

  const nextTier = PRICE_TIERS.find(t => t.min > totalCards)

  return (
    <div className="price-panel">
      <h3 className="font-bold text-base mb-4" style={{ color: '#fff' }}>Resumen de precio</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span style={{ color: 'var(--color-text-muted)' }}>
            {totalCards} carta{totalCards !== 1 ? 's' : ''} × {pricePerCard.toFixed(2)} €
          </span>
          <span className="font-semibold">{subtotal.toFixed(2)} €</span>
        </div>

        <div className="flex justify-between items-center">
          <span style={{ color: 'var(--color-text-muted)' }}>Envío</span>
          <span className="font-semibold">{shippingCost.toFixed(2)} €</span>
        </div>

        <div
          className="flex justify-between items-center pt-3 font-bold text-base"
          style={{ borderTop: '1px solid rgba(124,58,237,0.2)', marginTop: '4px' }}
        >
          <span style={{ color: '#fff' }}>Total</span>
          <span style={{ color: '#a78bfa', fontSize: '1.15rem' }}>{total.toFixed(2)} €</span>
        </div>
      </div>

      {nextTier && (
        <div className="next-tier-tip">
          💡 Añade {nextTier.min - totalCards} carta{nextTier.min - totalCards !== 1 ? 's' : ''}{' '}más → {nextTier.price.toFixed(2)} €/carta
        </div>
      )}
    </div>
  )
}
