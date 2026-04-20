'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/lib/cartStore'
import PriceCalculator from '@/components/PriceCalculator'
import DownloadPDFButton from '@/components/DownloadPDFButton'

const COUNTRIES = [
  { code: 'ES', label: 'España' },
  { code: 'DE', label: 'Alemania' },
  { code: 'FR', label: 'Francia' },
  { code: 'IT', label: 'Italia' },
  { code: 'PT', label: 'Portugal' },
  { code: 'NL', label: 'Países Bajos' },
  { code: 'BE', label: 'Bélgica' },
  { code: 'PL', label: 'Polonia' },
  { code: 'US', label: 'Estados Unidos' },
  { code: 'GB', label: 'Reino Unido' },
  { code: 'MX', label: 'México' },
  { code: 'AR', label: 'Argentina' },
]

const GAME_GRADIENT: Record<string, string> = {
  mtg:      'linear-gradient(135deg, #4c1d95, #7c3aed)',
  pokemon:  'linear-gradient(135deg, #92400e, #d97706)',
  yugioh:   'linear-gradient(135deg, #1e3a8a, #3b82f6)',
  lorcana:  'linear-gradient(135deg, #164e63, #06b6d4)',
  onepiece: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
  custom:   'linear-gradient(135deg, #064e3b, #10b981)',
}

const ANIM_DURATION = 380

export default function CartPage() {
  const router = useRouter()
  const cards = useCartStore(s => s.cards)
  const removeCard = useCartStore(s => s.removeCard)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const shippingCountry = useCartStore(s => s.shippingCountry)
  const setShippingCountry = useCartStore(s => s.setShippingCountry)
  const totalCards = useCartStore(s => s.totalCards())

  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  const handleRemove = (id: string) => {
    setRemovingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      removeCard(id)
      setRemovingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, ANIM_DURATION)
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-28 text-center">
        <p className="text-2xl font-bold mb-3" style={{ color: '#fff' }}>Tu carrito está vacío</p>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>Sube tus cartas para empezar</p>
        <Link href="/editor" className="btn-primary inline-block px-8 py-3 text-base font-bold">
          Añadir cartas
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="section-tag mb-3">Carrito</div>
        <h1 className="section-title">{totalCards} carta{totalCards !== 1 ? 's' : ''} en tu pedido</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card list */}
        <div className="lg:col-span-2 space-y-3">
          {cards.map(card => {
            const isRemoving = removingIds.has(card.id)
            return (
              <div
                key={card.id}
                className={isRemoving ? 'cart-item-removing' : 'card-item-enter'}
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  gap: '16px',
                }}
              >
                {/* Thumbnail con fallback */}
                <CardImage imageUrl={card.imageUrl} game={card.game} name={card.name} />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate mb-1" style={{ color: '#fff' }}>
                    {card.name ?? 'Carta personalizada'}
                  </p>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    {card.game.toUpperCase()}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => card.quantity === 1 ? handleRemove(card.id) : updateQuantity(card.id, card.quantity - 1)}
                      className="qty-btn"
                    >−</button>
                    <span className="text-sm w-7 text-center font-bold" style={{ color: '#fff' }}>{card.quantity}</span>
                    <button
                      onClick={() => updateQuantity(card.id, card.quantity + 1)}
                      className="qty-btn"
                    >+</button>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(card.id)}
                  className="shrink-0 self-start w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                  style={{ color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.04)' }}
                  title="Eliminar"
                >✕</button>
              </div>
            )
          })}

          <Link href="/editor" className="inline-flex text-sm font-semibold mt-2"
            style={{ color: '#a78bfa' }}>
            + Añadir más cartas
          </Link>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="surface-card p-5">
            <label className="block text-sm font-bold mb-2" style={{ color: '#fff' }}>
              País de envío
            </label>
            <select
              value={shippingCountry}
              onChange={e => setShippingCountry(e.target.value)}
              className="input-field select-field w-full"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          <PriceCalculator />

          <DownloadPDFButton />

          <div
            className="p-3 rounded-xl text-xs text-center font-semibold"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--color-accent)' }}
          >
            ⚠ PROXIES no oficiales · No válidas para torneos
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="btn-primary w-full py-4 text-base font-bold"
          >
            Finalizar pedido ({totalCards} cartas)
          </button>
        </aside>
      </div>
    </div>
  )
}

function CardImage({ imageUrl, game, name }: { imageUrl: string; game: string; name?: string }) {
  const [broken, setBroken] = useState(false)
  const gradient = GAME_GRADIENT[game] ?? 'linear-gradient(135deg, #1a1a35, #2d2d4e)'

  const baseStyle: React.CSSProperties = {
    width: '52px',
    aspectRatio: '63/88',
    borderRadius: '6px',
    flexShrink: 0,
    overflow: 'hidden',
  }

  if (broken) {
    return (
      <div style={{ ...baseStyle, background: gradient, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px' }}>
        <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {game}
        </span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={name ?? 'carta'}
      onError={() => setBroken(true)}
      style={{ ...baseStyle, objectFit: 'cover' }}
    />
  )
}
