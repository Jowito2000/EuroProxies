'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import CardUploader from '@/components/CardUploader'
import CardSearch from '@/components/CardSearch'
import DeckImporter, { DeckPrint } from '@/components/DeckImporter'
import PriceCalculator from '@/components/PriceCalculator'
import { useCartStore } from '@/lib/cartStore'
import { useFileStore } from '@/lib/fileStore'
import { Card } from '@/types/card'
import { SearchResult } from '@/lib/cardSearchApi'

type EditorTab = 'upload' | 'search' | 'import'

let searchIdCounter = 0
function genSearchId() {
  return `search-${Date.now()}-${++searchIdCounter}`
}

export default function EditorPage() {
  const router = useRouter()
  const addCard = useCartStore(s => s.addCard)
  const removeCard = useCartStore(s => s.removeCard)
  const addFile = useFileStore(s => s.addFile)
  const totalCards = useCartStore(s => s.totalCards())
  const [added, setAdded] = useState<{ count: number; ids: string[] } | null>(null)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showAddedToast = (cards: Card[]) => {
    setAdded({ count: cards.length, ids: cards.map(c => c.id) })
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setAdded(null), 5000)
  }

  const handleUndo = () => {
    if (!added) return
    added.ids.forEach(id => removeCard(id))
    setAdded(null)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
  }
  const [tab, setTab] = useState<EditorTab>('upload')
  const [searchAdding, setSearchAdding] = useState<string | null>(null)
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleCardsReady = (cards: Card[]) => {
    cards.forEach(addCard)
    showAddedToast(cards)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const downloadPrintAsCard = async (result: SearchResult, quantity: number): Promise<Card | null> => {
    const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(result.imageUrl)}`)
    if (!response.ok) return null
    const blob = await response.blob()
    const ext = blob.type.includes('png') ? 'png' : 'jpg'
    const file = new File([blob], `${result.name.replace(/[^a-zA-Z0-9 ]/g, '')}.${ext}`, { type: blob.type })

    const id = genSearchId()
    addFile(id, file)

    return {
      id,
      imageUrl: URL.createObjectURL(file),
      name: result.name,
      game: result.game,
      quantity,
      finish: 'normal',
      dpiValid: true,
    }
  }

  const handleSearchSelect = async (result: SearchResult) => {
    setSearchAdding(result.key)
    try {
      const card = await downloadPrintAsCard(result, 1)
      if (!card) return
      addCard(card)
      showAddedToast([card])
    } catch (err) {
      console.error('Failed to add card from search:', err)
    } finally {
      setSearchAdding(null)
    }
  }

  const handleAddPrints = async (items: DeckPrint[]) => {
    if (items.length === 0) return
    setBulkProgress({ done: 0, total: items.length })
    let totalAddedCards: Card[] = []
    try {
      for (let i = 0; i < items.length; i++) {
        const { print, quantity } = items[i]
        try {
          const card = await downloadPrintAsCard(print, quantity)
          if (card) {
            addCard(card)
            totalAddedCards.push(card)
          }
        } catch (err) {
          console.error(`Failed to download ${print.name}:`, err)
        }
        setBulkProgress({ done: i + 1, total: items.length })
      }
    } finally {
      setBulkProgress(null)
      if (totalAddedCards.length > 0) {
        showAddedToast(totalAddedCards)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="pointer-events-none select-none" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: -1, opacity: 0.04 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.png" alt="" style={{ maxWidth: '680px', width: '100%', objectFit: 'contain' }} />
      </div>
      {/* Header */}
      <div className="mb-10 relative">
        <div className="section-tag mb-3">Editor de cartas</div>
        <h1 className="section-title">Sube y configura tus proxies</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {tab === 'upload' && 'Arrastra tus imágenes, elige el acabado y añádelas al carrito.'}
          {tab === 'search' && 'Busca cartas oficiales por nombre y añádelas directamente.'}
          {tab === 'import' && 'Importa mazos enteros desde un decklist, una URL o explorando por edición.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative">
          {/* Tab switcher */}
          <div className="flex gap-2 mb-6">
            {([
              { key: 'upload' as EditorTab, icon: <img src="/icons/SubirArchivos.png" alt="" style={{ width: 18, height: 18, opacity: 0.9 }} />, label: 'Subir imagen' },
              { key: 'search' as EditorTab, icon: <img src="/icons/Buscar.png" alt="" style={{ width: 18, height: 18, opacity: 0.9 }} />, label: 'Buscar carta oficial' },
              { key: 'import' as EditorTab, icon: <img src="/images/TCGs/MTGIcon.png" alt="" style={{ width: 18, height: 18, opacity: 0.9, transform: 'translateX(-2px)' }} />, label: 'Importar mazo (MTG)' },
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

          {tab === 'upload' && <CardUploader onCardsReady={handleCardsReady} />}
          {tab === 'search' && (
            <div className="surface-card p-6 rounded-2xl">
              <CardSearch onSelect={handleSearchSelect} />
            </div>
          )}
          {tab === 'import' && (
            <div className="surface-card p-6 rounded-2xl">
              <DeckImporter onAddPrints={handleAddPrints} />
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <PriceCalculator />

          {mounted && totalCards > 0 && (
            <button
              onClick={() => router.push('/cart')}
              className="btn-primary w-full py-3 text-base font-bold"
            >
              Ver carrito ({totalCards}) →
            </button>
          )}

          <div className="surface-card p-4 text-xs space-y-2">
            <p className="font-bold text-sm mb-1" style={{ color: '#a78bfa' }}>
              {tab === 'upload' && '📋 Requisitos de imagen'}
              {tab === 'search' && '🔍 Buscador de cartas'}
              {tab === 'import' && <span className="flex items-center gap-2"><img src="/images/TCGs/MTGIcon.png" alt="" style={{ width: 16, height: 16, display: 'inline-block' }} /> Importar mazo</span>}
            </p>
            {tab === 'upload' && (
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
            )}
            {tab === 'search' && (
              <>
                <p style={{ color: 'var(--color-text-muted)' }}>• Elige un juego y escribe el nombre</p>
                <p style={{ color: 'var(--color-text-muted)' }}>• En MTG, las cartas con varias impresiones se agrupan</p>
                <p style={{ color: 'var(--color-text-muted)' }}>• Haz clic para añadir o elegir versión</p>
                <p style={{ color: '#f59e0b' }}>• La imagen se descarga automáticamente</p>
                <p className="pt-1" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  Las imágenes provienen de APIs públicas de la comunidad (Scryfall, PokémonTCG, YGOPRODeck...).
                </p>
              </>
            )}
            {tab === 'import' && (
              <>
                <p style={{ color: 'var(--color-text-muted)' }}>• <strong style={{ color: '#c4b5fd' }}>Pegar lista</strong>: formato MTGA/MTGO</p>
                <p style={{ color: 'var(--color-text-muted)' }}>• <strong style={{ color: '#c4b5fd' }}>URL</strong>: Archidekt, MTGGoldfish, TappedOut, Scryfall</p>
                <p style={{ color: 'var(--color-text-muted)' }}>• <strong style={{ color: '#c4b5fd' }}>Explorar sets</strong>: navega por edición</p>
                <p style={{ color: '#f59e0b' }}>• Sin set especificado → usa la impresión más reciente</p>
                <p className="pt-1" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  Moxfield no permite importación automática — exporta como texto y pégalo.
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

      {/* ── Fixed top-center toasts ── */}
      {bulkProgress && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9000, display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(18,12,40,0.92)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(124,58,237,0.4)', borderRadius: 14,
          padding: '10px 20px', color: '#c4b5fd', fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(124,58,237,0.25)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-purple-400 animate-spin" />
          Descargando {bulkProgress.done}/{bulkProgress.total} cartas…
        </div>
      )}

      {searchAdding && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9000, display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(18,12,40,0.92)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(124,58,237,0.4)', borderRadius: 14,
          padding: '10px 20px', color: '#c4b5fd', fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(124,58,237,0.25)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-purple-400 animate-spin" />
          Descargando carta...
        </div>
      )}

      {added && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9000, display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(16,185,129,0.12)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(16,185,129,0.4)', borderRadius: 14,
          padding: '8px 12px 8px 20px', color: '#34d399', fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(16,185,129,0.2)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          ✓ {added.count} carta{added.count !== 1 ? 's' : ''} añadida{added.count !== 1 ? 's' : ''} al carrito
          <button
            onClick={handleUndo}
            style={{
              background: 'rgba(16,185,129,0.2)',
              border: '1px solid rgba(16,185,129,0.4)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
          >
            Deshacer
          </button>
        </div>
      )}
    </div>
  )
}
