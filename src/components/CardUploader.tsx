'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { MAX_FILE_SIZE_BYTES } from '@/utils/constants'
import { validateImageFile } from '@/lib/validators'
import { Card, TCGGame } from '@/types/card'
import { useFileStore } from '@/lib/fileStore'

const TCG_DIMENSIONS: Record<string, string> = {
  mtg: '63×88 mm',
  pokemon: '63×88 mm',
  yugioh: '59×86 mm',
  lorcana: '63×88 mm',
  onepiece: '63×88 mm',
  custom: 'variable',
}

interface UploadedCard {
  file: File
  previewUrl: string
  card: Card
  errors: string[]
  warnings: string[]
  validating: boolean
}

interface CardUploaderProps {
  onCardsReady: (cards: Card[]) => void
}

let idCounter = 0
function genId() {
  return `card-${Date.now()}-${++idCounter}`
}

export default function CardUploader({ onCardsReady }: CardUploaderProps) {
  const [items, setItems] = useState<UploadedCard[]>([])
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const addFile = useFileStore(s => s.addFile)

  const processFile = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    const id = genId()

    addFile(id, file)

    const placeholder: UploadedCard = {
      file,
      previewUrl,
      card: { id, imageUrl: previewUrl, game: 'mtg', quantity: 1, finish: 'normal', dpiValid: false },
      errors: [],
      warnings: [],
      validating: true,
    }

    setItems(prev => [...prev, placeholder])

    const result = await validateImageFile(file)

    setItems(prev =>
      prev.map(item =>
        item.card.id === id
          ? {
              ...item,
              validating: false,
              errors: result.errors,
              warnings: result.warnings,
              card: { ...item.card, dpiValid: result.valid, width: result.width, height: result.height },
            }
          : item
      )
    )
  }, [addFile])

  const onDrop = useCallback((accepted: File[]) => {
    accepted.forEach(processFile)
  }, [processFile])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: true,
  })

  const updateItem = (id: string, patch: Partial<Card>) => {
    setItems(prev =>
      prev.map(item => (item.card.id === id ? { ...item, card: { ...item.card, ...patch } } : item))
    )
  }

  const removeItem = (id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.card.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter(i => i.card.id !== id)
    })
  }

  const validCards = items.filter(i => i.errors.length === 0 && !i.validating)

  const handleAddToCart = () => {
    onCardsReady(validCards.map(i => i.card))
    setItems([])
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={isDragActive ? 'dropzone-active' : 'dropzone-idle'}
        style={{ padding: '48px 32px', textAlign: 'center' }}
      >
        <input {...getInputProps()} />
        <div className="upload-icon-wrap">
          {isDragActive ? '🎯' : '📂'}
        </div>
        <p className="font-bold text-lg mb-1" style={{ color: isDragActive ? '#c4b5fd' : 'var(--color-text)' }}>
          {isDragActive ? '¡Suelta las imágenes aquí!' : 'Arrastra tus cartas aquí'}
        </p>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
          JPG, PNG, WEBP · Máx. 10 MB · Recomendado ≥300 DPI
        </p>
        <button
          type="button"
          className="btn-primary px-6 py-2 text-sm"
          onClick={e => { e.stopPropagation(); open() }}
        >
          O selecciona archivos
        </button>
      </div>

      {/* Card list */}
      {items.length > 0 && (
        <div className="space-y-3">
          {/* Sticky quick-add bar — always reachable without scrolling */}
          {validCards.length > 0 && (
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                position: 'sticky',
                top: '72px',
                zIndex: 20,
                background: 'rgba(15,10,30,0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(124,58,237,0.3)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
            >
              <span className="text-sm font-semibold" style={{ color: '#c4b5fd' }}>
                {validCards.length} carta{validCards.length !== 1 ? 's' : ''} listas
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="group flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:bg-red-500/15 hover:-translate-y-0.5"
                  style={{ 
                    color: 'var(--color-danger)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.0)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.0)'}
                >
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-12 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Vaciar
                </button>
                <button onClick={handleAddToCart} className="btn-primary px-5 py-2 text-sm font-bold">
                  Añadir al carrito →
                </button>
              </div>
            </div>
          )}

          {items.map(item => (
            <CardItem
              key={item.card.id}
              item={item}
              tcgDimensions={TCG_DIMENSIONS}
              onUpdate={updateItem}
              onRemove={removeItem}
              onPreviewClick={(url, name) => setLightbox({ url, name })}
            />
          ))}
        </div>
      )}

      {/* Add to cart — bottom anchor */}
      {validCards.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleAddToCart}
            className="btn-primary px-7 py-3 text-base font-bold"
          >
            Añadir {validCards.length} carta{validCards.length !== 1 ? 's' : ''} al carrito
          </button>
        </div>
      )}

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div
          onClick={() => setShowClearConfirm(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(6px)',
            animation: 'fadeIn 0.18s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="p-6 rounded-2xl border text-center relative overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(239, 68, 68, 0.15)',
              animation: 'panel-card-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
              maxWidth: '360px',
              width: '100%',
            }}
          >
            {/* Background glow */}
            <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">¿Vaciar subida?</h3>
            <p className="text-sm mb-7 relative z-10" style={{ color: 'var(--color-text-muted)' }}>
              Se eliminarán todas las imágenes que has subido. Tendrás que volver a seleccionarlas.
            </p>
            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl font-bold transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setItems([])
                  setShowClearConfirm(false)
                }}
                className="flex-1 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5"
                style={{ background: '#ef4444', color: '#fff', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)', border: '1px solid rgba(255,100,100,0.5)' }}
              >
                Sí, vaciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(6px)',
            animation: 'fadeIn 0.18s ease',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '340px', width: '100%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt={lightbox.name}
              style={{
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 0 60px rgba(124,58,237,0.4)',
                display: 'block',
              }}
            />
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute', top: '-14px', right: '-14px',
                width: '32px', height: '32px',
                borderRadius: '50%',
                background: 'rgba(30,20,50,0.95)',
                border: '1px solid rgba(124,58,237,0.4)',
                color: '#fff',
                fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Cerrar"
            >✕</button>
          </div>
        </div>
      )}
    </div>
  )
}

function CardItem({
  item,
  tcgDimensions,
  onUpdate,
  onRemove,
  onPreviewClick,
}: {
  item: UploadedCard
  tcgDimensions: Record<string, string>
  onUpdate: (id: string, patch: Partial<Card>) => void
  onRemove: (id: string) => void
  onPreviewClick: (url: string, name: string) => void
}) {
  const { card, errors, warnings, validating, previewUrl, file } = item
  const isOk = errors.length === 0 && !validating

  return (
    <div
      className="card-item-enter flex gap-4 p-4 rounded-xl"
      style={{
        background: 'var(--color-surface-2)',
        border: `1px solid ${errors.length > 0 ? 'rgba(239,68,68,0.4)' : 'rgba(124,58,237,0.2)'}`,
        transition: 'border-color 0.2s',
      }}
    >
      {/* Preview */}
      <div
        className="card-thumb shrink-0 rounded-lg overflow-hidden"
        style={{ width: '60px', aspectRatio: '63/88', background: 'var(--color-surface-3)', cursor: 'zoom-in' }}
        onClick={() => onPreviewClick(previewUrl, file.name)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate mb-2" style={{ color: '#fff' }}>{file.name}</p>

        {validating && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span className="inline-block w-3 h-3 rounded-full border-2 border-t-transparent border-purple-500 animate-spin" />
            Validando imagen...
          </div>
        )}

        {errors.length > 0 && (
          <ul className="text-xs mb-2 space-y-1" style={{ color: 'var(--color-danger)' }}>
            {errors.map((e, i) => <li key={i}>⚠ {e}</li>)}
          </ul>
        )}

        {warnings.length > 0 && (
          <ul className="text-xs mb-2 space-y-1" style={{ color: '#f59e0b' }}>
            {warnings.map((w, i) => <li key={i}>⚡ {w}</li>)}
          </ul>
        )}

        {isOk && (
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={card.game}
              onChange={e => onUpdate(card.id, { game: e.target.value as TCGGame })}
              className="select-field"
            >
              <option value="mtg">MTG</option>
              <option value="pokemon">Pokémon</option>
              <option value="yugioh">Yu-Gi-Oh</option>
              <option value="lorcana">Lorcana</option>
              <option value="onepiece">One Piece</option>
              <option value="custom">Custom</option>
            </select>

            <span className="text-xs px-2 py-1 rounded-md" style={{ color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tcgDimensions[card.game] ?? '63×88 mm'}
            </span>

            <div className="flex items-center gap-1">
              <button
                className="qty-btn"
                onClick={() => onUpdate(card.id, { quantity: Math.max(1, card.quantity - 1) })}
              >−</button>
              <span className="text-sm w-7 text-center font-bold" style={{ color: '#fff' }}>{card.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => onUpdate(card.id, { quantity: card.quantity + 1 })}
              >+</button>
            </div>
          </div>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(card.id)}
        className="shrink-0 self-start text-sm font-bold w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
        style={{ color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.04)' }}
        title="Eliminar"
      >
        ✕
      </button>
    </div>
  )
}
