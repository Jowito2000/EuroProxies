'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CardUploader from '@/components/CardUploader'
import PriceCalculator from '@/components/PriceCalculator'
import { useCartStore } from '@/lib/cartStore'
import { Card } from '@/types/card'

export default function EditorPage() {
  const router = useRouter()
  const addCard = useCartStore(s => s.addCard)
  const totalCards = useCartStore(s => s.totalCards())
  const [added, setAdded] = useState(0)

  const handleCardsReady = (cards: Card[]) => {
    cards.forEach(addCard)
    setAdded(cards.length)
    setTimeout(() => setAdded(0), 3000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12" style={{ position: 'relative' }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] select-none flex items-center justify-center -z-10">
        <img src="/favicon.png" alt="" className="max-w-3xl w-full object-contain" />
      </div>
      {/* Header */}
      <div className="mb-10 relative z-10">
        <div className="section-tag mb-3">Editor de cartas</div>
        <h1 className="section-title">Sube y configura tus proxies</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Arrastra tus imágenes, elige el acabado y añádelas al carrito.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CardUploader onCardsReady={handleCardsReady} />

          {added > 0 && (
            <div className="success-toast mt-4">
              ✓ {added} carta{added !== 1 ? 's' : ''} añadida{added !== 1 ? 's' : ''} al carrito
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <PriceCalculator />

          {totalCards > 0 && (
            <button
              onClick={() => router.push('/cart')}
              className="btn-primary w-full py-3 text-base font-bold"
            >
              Ver carrito ({totalCards}) →
            </button>
          )}

          <div className="surface-card p-4 text-xs space-y-2">
            <p className="font-bold text-sm mb-1" style={{ color: '#a78bfa' }}>
              📋 Requisitos de imagen
            </p>
            <p style={{ color: 'var(--color-text-muted)' }}>• Formatos: JPG, PNG, WEBP</p>
            <p style={{ color: 'var(--color-text-muted)' }}>• Tamaño máximo: 10 MB</p>
            <p style={{ color: '#f59e0b' }}>• Resolución recomendada: ≥744 px por lado</p>
            <div className="pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Medidas de carta</p>
              <p style={{ color: 'var(--color-text-muted)' }}>MTG / Pokémon / Lorcana / One Piece</p>
              <p style={{ color: '#fff' }}>63 × 88 mm</p>
              <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>Yu-Gi-Oh!</p>
              <p style={{ color: '#fff' }}>59 × 86 mm</p>
            </div>
          </div>

          <div
            className="p-3 rounded-xl text-xs text-center font-semibold"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--color-accent)' }}
          >
            ⚠ PROXIES no oficiales · Solo uso casual
          </div>
        </aside>
      </div>
    </div>
  )
}
