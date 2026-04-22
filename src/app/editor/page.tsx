'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CardUploader from '@/components/CardUploader'
import CardSearch from '@/components/CardSearch'
import PriceCalculator from '@/components/PriceCalculator'
import { useCartStore } from '@/lib/cartStore'
import { useFileStore } from '@/lib/fileStore'
import { Card } from '@/types/card'
import { SearchResult } from '@/lib/cardSearchApi'

type EditorTab = 'upload' | 'search'

let searchIdCounter = 0
function genSearchId() {
  return `search-${Date.now()}-${++searchIdCounter}`
}

export default function EditorPage() {
  const router = useRouter()
  const addCard = useCartStore(s => s.addCard)
  const addFile = useFileStore(s => s.addFile)
  const totalCards = useCartStore(s => s.totalCards())
  const [added, setAdded] = useState(0)
  const [tab, setTab] = useState<EditorTab>('upload')
  const [searchAdding, setSearchAdding] = useState<string | null>(null)

  const handleCardsReady = (cards: Card[]) => {
    cards.forEach(addCard)
    setAdded(cards.length)
    setTimeout(() => setAdded(0), 3000)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchSelect = async (result: SearchResult) => {
    setSearchAdding(result.key)
    try {
      // Download the image and convert to a File for the existing pipeline
      // We proxy through our API to avoid CORS issues from Scryfall/Pokemon/Yugioh APIs
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(result.imageUrl)}`)
      const blob = await response.blob()
      const ext = blob.type.includes('png') ? 'png' : 'jpg'
      const file = new File([blob], `${result.name.replace(/[^a-zA-Z0-9 ]/g, '')}.${ext}`, { type: blob.type })

      const id = genSearchId()
      addFile(id, file)

      const card: Card = {
        id,
        imageUrl: URL.createObjectURL(file),
        name: result.name,
        game: result.game,
        quantity: 1,
        finish: 'normal',
        dpiValid: true,
      }

      addCard(card)
      setAdded(1)
      setTimeout(() => setAdded(0), 3000)
    } catch (err) {
      console.error('Failed to add card from search:', err)
    } finally {
      setSearchAdding(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="pointer-events-none select-none" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0, opacity: 0.04 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.png" alt="" style={{ maxWidth: '680px', width: '100%', objectFit: 'contain' }} />
      </div>
      {/* Header */}
      <div className="mb-10 relative z-10">
        <div className="section-tag mb-3">Editor de cartas</div>
        <h1 className="section-title">Sube y configura tus proxies</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {tab === 'upload'
            ? 'Arrastra tus imágenes, elige el acabado y añádelas al carrito.'
            : 'Busca cartas oficiales por nombre y añádelas directamente.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative z-10">
          {/* Tab switcher */}
          <div className="flex gap-2 mb-6">
            {([
              { key: 'upload' as EditorTab, icon: <img src="/icons/SubirArchivos.png" alt="" style={{ width: 18, height: 18, opacity: 0.9 }} />, label: 'Subir imagen' },
              { key: 'search' as EditorTab, icon: <img src="/icons/Buscar.png" alt="" style={{ width: 18, height: 18, opacity: 0.9 }} />, label: 'Buscar carta oficial' },
            ]).map(t => {
              const isActive = tab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                  style={{
                    background: isActive ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? '#c4b5fd' : 'var(--color-text-muted)',
                    boxShadow: isActive ? '0 4px 20px rgba(124,58,237,0.2)' : 'none',
                    transform: isActive ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                      e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.transform = 'none'
                    }
                  }}
                >
                  {t.icon} {t.label}
                </button>
              )
            })}</div>

          {/* Tab content */}
          {tab === 'upload' ? (
            <CardUploader onCardsReady={handleCardsReady} />
          ) : (
            <div className="surface-card p-6 rounded-2xl">
              <CardSearch onSelect={handleSearchSelect} />
              {searchAdding && (
                <div className="flex items-center gap-2 mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-t-transparent border-purple-500" style={{ animation: 'spin 0.7s linear infinite' }} />
                  Descargando carta...
                </div>
              )}
            </div>
          )}

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
              {tab === 'upload' ? '📋 Requisitos de imagen' : '🔍 Buscador de cartas'}
            </p>
            {tab === 'upload' ? (
              <>
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
              </>
            ) : (
              <>
                <p style={{ color: 'var(--color-text-muted)' }}>• Elige un juego y escribe el nombre</p>
                <p style={{ color: 'var(--color-text-muted)' }}>• Se muestran las distintas versiones</p>
                <p style={{ color: 'var(--color-text-muted)' }}>• Haz clic en la carta que quieras</p>
                <p style={{ color: '#f59e0b' }}>• La imagen se descarga automáticamente</p>
                <p className="pt-1" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  Las imágenes provienen de APIs públicas de la comunidad (Scryfall, PokémonTCG, YGOPRODeck...).
                </p>
              </>
            )}
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
