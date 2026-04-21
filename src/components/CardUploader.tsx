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
  }, [])

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
    // Clear the uploader — DO NOT revoke blob URLs here; the cart still needs them to display images
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
          {items.map(item => (
            <CardItem key={item.card.id} item={item} tcgDimensions={TCG_DIMENSIONS} onUpdate={updateItem} onRemove={removeItem} />
          ))}
        </div>
      )}

      {/* Add to cart */}
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
    </div>
  )
}

function CardItem({
  item,
  tcgDimensions,
  onUpdate,
  onRemove,
}: {
  item: UploadedCard
  tcgDimensions: Record<string, string>
  onUpdate: (id: string, patch: Partial<Card>) => void
  onRemove: (id: string) => void
}) {
  const { card, errors, warnings, validating, previewUrl } = item
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
        className="shrink-0 rounded-lg overflow-hidden"
        style={{ width: '60px', aspectRatio: '63/88', background: 'var(--color-surface-3)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate mb-2" style={{ color: '#fff' }}>{item.file.name}</p>

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
