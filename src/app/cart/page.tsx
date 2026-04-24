'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/lib/cartStore'
import PriceCalculator from '@/components/PriceCalculator'
import DownloadPDFButton from '@/components/DownloadPDFButton'
import { useRestoreCartImages } from '@/lib/useRestoreCartImages'
import CountrySelect from '@/components/CountrySelect'
import PhonePrefixSelect from '@/components/PhonePrefixSelect'
import { lockScroll, unlockScroll } from '@/utils/scrollLock'
import { COUNTRIES, getCountryByCode } from '@/utils/countries'
import { getCardBacksForGame, getCardBackById, getDefaultCardBackForGame } from '@/lib/cardBacks'
import { idbSave } from '@/lib/imageDB'
import type { TCGGame } from '@/types/card'

const GAME_GRADIENT: Record<string, string> = {
  mtg: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
  pokemon: 'linear-gradient(135deg, #92400e, #d97706)',
  yugioh: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
  lorcana: 'linear-gradient(135deg, #164e63, #06b6d4)',
  onepiece: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
  custom: 'linear-gradient(135deg, #064e3b, #10b981)',
}

const ANIM_DURATION = 380

export default function CartPage() {
  const router = useRouter()
  const cards = useCartStore(s => s.cards)
  const removeCard = useCartStore(s => s.removeCard)
  const clearCart = useCartStore(s => s.clearCart)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const shippingCountry = useCartStore(s => s.shippingCountry)
  const setShippingCountry = useCartStore(s => s.setShippingCountry)
  const totalCards = useCartStore(s => s.totalCards())
  const isGeneratingPDF = useCartStore(s => s.isGeneratingPDF)
  const shippingDetails = useCartStore(s => s.shippingDetails)
  const updateShippingDetails = useCartStore(s => s.updateShippingDetails)
  const updateCardBack = useCartStore(s => s.updateCardBack)
  const updateAllCardBacks = useCartStore(s => s.updateAllCardBacks)
  const defaultCardBacks = useCartStore(s => s.defaultCardBacks)
  const setDefaultCardBack = useCartStore(s => s.setDefaultCardBack)
  const customCardBacks = useCartStore(s => s.customCardBacks)
  const setCustomCardBackImage = useCartStore(s => s.setCustomCardBackImage)

  // Extraer juegos únicos en el carrito para los selectores globales
  const uniqueGames = Array.from(new Set(cards.map(c => c.game)))

  const currentCountryInfo = getCountryByCode(shippingCountry)
  const isFormComplete = shippingCountry && shippingDetails.fullName && shippingDetails.phone && shippingDetails.address && shippingDetails.number && shippingDetails.city && shippingDetails.province

  const missingFields = []
  if (!shippingDetails.fullName) missingFields.push('Nombre')
  if (!shippingDetails.phone) missingFields.push('Teléfono')
  if (!shippingDetails.province) missingFields.push(currentCountryInfo?.regionLabel.split(' / ')[0] || 'Provincia')
  if (!shippingDetails.city) missingFields.push(currentCountryInfo?.cityLabel.split(' / ')[0] || 'Localidad')
  if (!shippingDetails.address) missingFields.push('Calle / Vía')
  if (!shippingDetails.number) missingFields.push('Número')

  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const [lightbox, setLightbox] = useState<{ url: string; name?: string } | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [backPickerCardId, setBackPickerCardId] = useState<string | null>(null)
  const [globalBackPickerGame, setGlobalBackPickerGame] = useState<TCGGame | null>(null)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [ratioWarning, setRatioWarning] = useState<{ msg: string; onConfirm: () => void; onCancel: () => void } | null>(null)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  useRestoreCartImages()

  useEffect(() => { setHasHydrated(true) }, [])

  useEffect(() => {
    const isLocked = !!(backPickerCardId || globalBackPickerGame || ratioWarning || zoomedImage)
    if (isLocked) {
      lockScroll()
      return () => unlockScroll()
    }
  }, [backPickerCardId, globalBackPickerGame, ratioWarning, zoomedImage])

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

  const handleCustomBackUpload = (cardBackId: string, file: File, input?: HTMLInputElement, globalGame?: TCGGame) => {
    if (!file) return
    
    // Validar aspect ratio
    const img = new Image()
    img.onload = () => {
      const actualRatio = img.width / img.height
      const isYgo = cardBackId.includes('yugioh')
      const targetRatio = isYgo ? (59 / 86) : (63 / 88)
      const diff = Math.abs(actualRatio - targetRatio)

      const proceed = () => {
        idbSave(`back-${cardBackId}`, file).catch(console.error)
        const blobUrl = URL.createObjectURL(file)
        setCustomCardBackImage(cardBackId, blobUrl)
        if (input) input.value = ''
        if (globalGame) {
          setDefaultCardBack(globalGame, cardBackId)
          updateAllCardBacks(globalGame, cardBackId)
        } else if (backPickerCardId) {
          updateCardBack(backPickerCardId, cardBackId)
        }
        setRatioWarning(null)
      }

      if (diff > 0.05) {
        setRatioWarning({
          msg: isYgo 
            ? "La imagen no tiene las proporciones de una carta de Yu-Gi-Oh (59x86mm). Se adaptará al espacio y puede verse deformada o recortada."
            : "La imagen no tiene las proporciones estándar (63x88mm). Se adaptará al espacio y puede verse deformada o recortada.",
          onConfirm: proceed,
          onCancel: () => {
            if (input) input.value = ''
            setRatioWarning(null)
          }
        })
      } else {
        proceed()
      }
    }
    img.src = URL.createObjectURL(file)
  }

  const getBackUrl = (backId: string) => {
    if (backId.startsWith('custom-') && customCardBacks[backId]) return customCardBacks[backId]
    return getCardBackById(backId).imageUrl
  }

  if (!hasHydrated) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 340px' }}>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="surface-card p-4 flex gap-4 items-center" style={{ animation: `fadeIn 0.3s ease ${i * 0.08}s both` }}>
                <div style={{ width: 56, height: 80, borderRadius: 8, background: 'rgba(124,58,237,0.12)', flexShrink: 0 }} />
                <div className="flex-1 space-y-2">
                  <div style={{ height: 14, borderRadius: 6, background: 'rgba(255,255,255,0.07)', width: '55%' }} />
                  <div style={{ height: 11, borderRadius: 6, background: 'rgba(255,255,255,0.05)', width: '35%' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="surface-card p-5" style={{ height: 120 }} />
            <div className="surface-card p-5" style={{ height: 60 }} />
          </div>
        </div>
      </div>
    )
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
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <div className="pointer-events-none select-none" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0, opacity: 0.04 }}>
        <img src="/favicon.png" alt="" style={{ maxWidth: '680px', width: '100%', objectFit: 'contain' }} />
      </div>
      <div className="mb-8 relative z-10">
        <div className="section-tag mb-3">Carrito</div>
        <div className="flex items-center justify-between">
          <h1 className="section-title mb-0">{totalCards} carta{totalCards !== 1 ? 's' : ''} en tu pedido</h1>
          <button
            onClick={() => !isGeneratingPDF && setShowClearConfirm(true)}
            className="group flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:bg-red-500/15 hover:-translate-y-0.5"
            style={{
              color: 'var(--color-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.08)',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.0)',
              opacity: isGeneratingPDF ? 0.5 : 1,
              pointerEvents: isGeneratingPDF ? 'none' : 'auto'
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.0)'}
          >
            <svg className="w-4 h-4 transition-transform group-hover:rotate-12 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Vaciar carrito
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        {/* Card list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ alignContent: 'start', ...(isGeneratingPDF ? { pointerEvents: 'none', opacity: 0.6, filter: 'grayscale(0.5)' } : {}) }}>
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
                <CardImage
                  imageUrl={card.imageUrl}
                  game={card.game}
                  name={card.name}
                  onClick={() => setLightbox({ url: card.imageUrl, name: card.name })}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate mb-1" style={{ color: '#fff' }}>
                    {card.name ?? 'Carta personalizada'}
                  </p>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    {card.game.toUpperCase()}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '30px' }}>
                    <button onClick={() => updateQuantity(card.id, Math.max(1, card.quantity - 10))} className="qty-step">−10</button>
                    <button
                      onClick={() => card.quantity === 1 ? handleRemove(card.id) : updateQuantity(card.id, card.quantity - 1)}
                      className="qty-btn"
                    >−</button>
                    <span style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700, width: '28px', textAlign: 'center', lineHeight: '30px' }}>{card.quantity}</span>
                    <button onClick={() => updateQuantity(card.id, card.quantity + 1)} className="qty-btn">+</button>
                    <button onClick={() => updateQuantity(card.id, card.quantity + 10)} className="qty-step">+10</button>
                  </div>

                  <button
                    onClick={() => setBackPickerCardId(card.id)}
                    className="mt-2 flex items-center gap-2 text-xs px-2 py-1 rounded-lg"
                    style={{
                      background: 'rgba(124,58,237,0.08)',
                      border: '1px solid rgba(124,58,237,0.2)',
                      color: '#a78bfa',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)' }}
                  >
                    <img
                      src={getBackUrl(card.cardBackId || getDefaultCardBackForGame(card.game))}
                      alt="Dorso"
                      style={{ width: 16, height: 22, borderRadius: 2, objectFit: 'cover' }}
                    />
                    {getCardBackById(card.cardBackId || getDefaultCardBackForGame(card.game)).name} ▾
                  </button>
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

          <Link href="/editor"
            className="flex items-center justify-center text-sm font-semibold rounded-xl"
            style={{
              color: '#a78bfa',
              border: '2px dashed rgba(124,58,237,0.25)',
              background: 'rgba(124,58,237,0.04)',
              minHeight: 140,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.background = 'rgba(124,58,237,0.08)' }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; e.currentTarget.style.background = 'rgba(124,58,237,0.04)' }}
          >
            + Añadir más cartas
          </Link>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          
          {uniqueGames.length > 0 && (
            <div className="surface-card p-4 rounded-xl space-y-3">
              <h2 className="font-bold text-sm" style={{ color: '#fff' }}>Dorsos globales por TCG</h2>
              {uniqueGames.map(game => {
                const currentDefault = defaultCardBacks[game] || getDefaultCardBackForGame(game)
                return (
                  <button
                    key={game}
                    onClick={() => setGlobalBackPickerGame(game)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  >
                    <img 
                      src={getBackUrl(currentDefault)} 
                      alt="" 
                      style={{ width: 28, height: 39, borderRadius: 3, objectFit: 'cover' }} 
                    />
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{game.toUpperCase()}</p>
                      <p className="text-xs font-bold" style={{ color: '#a78bfa' }}>{getCardBackById(currentDefault).name} ▾</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <PriceCalculator />

          <DownloadPDFButton />

          <div
            className="p-3 rounded-xl text-xs text-center font-semibold"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--color-accent)' }}
          >
            ⚠ PROXIES no oficiales · No válidas para torneos
          </div>

          <div>
            {showErrors && !isFormComplete && !isGeneratingPDF && (
              <div
                className="text-xs text-red-400 font-semibold text-center mb-3 bg-red-500/10 py-2 rounded-lg border border-red-500/30"
                style={{ animation: 'panel-card-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
              >
                ⚠️ Falta rellenar: {missingFields.join(', ')}
              </div>
            )}
            <button
              onClick={() => {
                if (!isFormComplete) {
                  setShowErrors(true)
                } else {
                  router.push('/checkout')
                }
              }}
              disabled={isGeneratingPDF}
              className="btn-primary w-full py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finalizar pedido ({totalCards} cartas)
            </button>
          </div>

          <div className="surface-card p-5">
            <h2 className="font-bold mb-4" style={{ color: '#fff', fontSize: '1.1rem' }}>Datos de envío</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#fff' }}>
                  País de destino
                </label>
                <CountrySelect
                  value={shippingCountry}
                  onChange={setShippingCountry}
                  disabled={isGeneratingPDF}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#fff' }}>Nombre completo</label>
                <input
                  type="text"
                  value={shippingDetails.fullName}
                  onChange={e => updateShippingDetails({ fullName: e.target.value })}
                  className="input-field w-full text-sm py-2 transition-colors"
                  placeholder="Ej: Juan Pérez"
                  disabled={isGeneratingPDF}
                  style={{ borderColor: showErrors && !shippingDetails.fullName ? 'rgba(239,68,68,0.5)' : undefined }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#fff' }}>Teléfono</label>
                <div className="flex gap-2">
                  <PhonePrefixSelect
                    value={shippingDetails.phonePrefix}
                    onChange={(dialCode) => updateShippingDetails({ phonePrefix: dialCode })}
                    disabled={isGeneratingPDF}
                  />
                  <input
                    type="tel"
                    value={shippingDetails.phone}
                    onChange={e => updateShippingDetails({ phone: e.target.value })}
                    className="input-field w-full text-sm py-2 transition-colors"
                    placeholder="600 000 000"
                    disabled={isGeneratingPDF}
                    style={{ borderColor: showErrors && !shippingDetails.phone ? 'rgba(239,68,68,0.5)' : undefined }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold mb-1" style={{ color: '#fff' }}>
                    {currentCountryInfo ? currentCountryInfo.regionLabel : 'Región'}
                  </label>
                  <input
                    type="text"
                    value={shippingDetails.province}
                    onChange={e => updateShippingDetails({ province: e.target.value })}
                    className="input-field w-full text-sm py-2 transition-colors"
                    placeholder="Ej: Madrid"
                    disabled={isGeneratingPDF}
                    style={{ borderColor: showErrors && !shippingDetails.province ? 'rgba(239,68,68,0.5)' : undefined }}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold mb-1" style={{ color: '#fff' }}>
                    {currentCountryInfo ? currentCountryInfo.cityLabel : 'Ciudad'}
                  </label>
                  <input
                    type="text"
                    value={shippingDetails.city}
                    onChange={e => updateShippingDetails({ city: e.target.value })}
                    className="input-field w-full text-sm py-2 transition-colors"
                    placeholder={shippingCountry === 'ES' ? 'Ej: Leganés' : 'Ej: Ciudad'}
                    disabled={isGeneratingPDF}
                    style={{ borderColor: showErrors && !shippingDetails.city ? 'rgba(239,68,68,0.5)' : undefined }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#fff' }}>Calle / Vía</label>
                <input
                  type="text"
                  value={shippingDetails.address}
                  onChange={e => updateShippingDetails({ address: e.target.value })}
                  className="input-field w-full text-sm py-2 transition-colors"
                  placeholder="Ej: Paseo de la Castellana 15"
                  disabled={isGeneratingPDF}
                  style={{ borderColor: showErrors && !shippingDetails.address ? 'rgba(239,68,68,0.5)' : undefined }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold mb-1" style={{ color: '#fff' }}>Número</label>
                  <input
                    type="text"
                    value={shippingDetails.number}
                    onChange={e => updateShippingDetails({ number: e.target.value })}
                    className="input-field w-full text-sm py-2 transition-colors"
                    placeholder="Ej: 15"
                    disabled={isGeneratingPDF}
                    style={{ borderColor: showErrors && !shippingDetails.number ? 'rgba(239,68,68,0.5)' : undefined }}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold mb-1" style={{ color: '#fff' }}>Piso (Opc.)</label>
                  <input
                    type="text"
                    value={shippingDetails.floor}
                    onChange={e => updateShippingDetails({ floor: e.target.value })}
                    className="input-field w-full text-sm py-2"
                    placeholder="Ej: 3º"
                    disabled={isGeneratingPDF}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold mb-1" style={{ color: '#fff' }}>Letra (Opc.)</label>
                  <input
                    type="text"
                    value={shippingDetails.door}
                    onChange={e => updateShippingDetails({ door: e.target.value })}
                    className="input-field w-full text-sm py-2"
                    placeholder="Ej: B"
                    disabled={isGeneratingPDF}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
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
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">¿Vaciar carrito?</h3>
            <p className="text-sm mb-7 relative z-10" style={{ color: 'var(--color-text-muted)' }}>
              Vas a eliminar todas las cartas de tu pedido actual. Esta acción no se puede deshacer.
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
                  clearCart()
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
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', maxWidth: '340px', width: '100%' }}
          >
            <img
              src={lightbox.url}
              alt={lightbox.name ?? 'carta'}
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

      {/* Card Back Picker Modal */}
      {backPickerCardId && (() => {
        const targetCard = cards.find(c => c.id === backPickerCardId)
        if (!targetCard) return null
        const options = getCardBacksForGame(targetCard.game)
        const currentBackId = targetCard.cardBackId || getDefaultCardBackForGame(targetCard.game)
        return (
          <div
            onClick={() => setBackPickerCardId(null)}
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
              style={{
                background: 'var(--color-surface)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: 16,
                padding: 24,
                maxWidth: 600,
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
              className="scrollbar-thin"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base" style={{ color: '#fff' }}>
                  Elegir dorso para: <span style={{ color: '#a78bfa' }}>{targetCard.name || 'Carta'}</span>
                </h3>
                <button
                  onClick={() => setBackPickerCardId(null)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.8rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none' }}
                >✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
                {options.map(opt => {
                  const isSelected = opt.id === currentBackId
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (opt.id.startsWith('custom-') && !customCardBacks[opt.id]) {
                          return
                        }
                        updateCardBack(backPickerCardId, opt.id)
                        setBackPickerCardId(null)
                      }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        padding: 8, borderRadius: 10, cursor: 'pointer',
                        background: isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                    >
                      <div style={{ width: '100%', position: 'relative' }}>
                        <img
                          src={getBackUrl(opt.id)}
                          alt={opt.name}
                          style={{
                            width: '100%',
                            aspectRatio: '63/88',
                            objectFit: 'cover',
                            borderRadius: 6,
                            boxShadow: isSelected ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
                          }}
                        />
                        {opt.id.startsWith('custom-') && (
                          <label
                            htmlFor={`file-picker-${opt.id}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                              position: 'absolute', bottom: 4, right: 4, 
                              background: 'rgba(124,58,237,0.9)', borderRadius: 6, 
                              padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 4,
                              cursor: 'pointer', zIndex: 10
                            }}
                          >
                            <svg style={{ width: 10, height: 10, color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span style={{ fontSize: '0.55rem', color: 'white', fontWeight: 800 }}>
                              {customCardBacks[opt.id] ? 'CAMBIAR' : 'SUBIR'}
                            </span>
                          </label>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setZoomedImage(getBackUrl(opt.id))
                          }}
                          style={{
                            position: 'absolute', top: 4, right: 4,
                            width: 24, height: 24, borderRadius: 6,
                            background: 'rgba(0,0,0,0.6)', color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 10, transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.transform = 'scale(1.1)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.transform = 'none' }}
                        >
                          <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </button>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: isSelected ? '#a78bfa' : 'var(--color-text-muted)', textAlign: 'center' }}>
                        {opt.name}
                      </span>
                      {opt.id.startsWith('custom-') && (
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`file-picker-${opt.id}`}
                          onClick={e => e.stopPropagation()}
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) handleCustomBackUpload(opt.id, file, e.target)
                          }}
                        />
                      )}
                      {isSelected && <span style={{ fontSize: '0.6rem', color: '#7c3aed', fontWeight: 700 }}>✓ Seleccionado</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Global Card Back Picker Modal */}
      {globalBackPickerGame && (() => {
        const game = globalBackPickerGame as any
        const options = getCardBacksForGame(game)
        const currentDefault = defaultCardBacks[game] || getDefaultCardBackForGame(game)
        return (
          <div
            onClick={() => setGlobalBackPickerGame(null)}
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
              style={{
                background: 'var(--color-surface)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: 16,
                padding: 24,
                maxWidth: 600,
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
              className="scrollbar-thin"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base" style={{ color: '#fff' }}>
                  Dorso global por TCG: <span style={{ color: '#a78bfa' }}>{String(game).toUpperCase()}</span>
                </h3>
                <button
                  onClick={() => setGlobalBackPickerGame(null)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.8rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none' }}
                >✕</button>
              </div>

              <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Se aplicará a todas las cartas de {String(game).toUpperCase()} en tu carrito.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
                {options.map(opt => {
                  const isSelected = opt.id === currentDefault
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (opt.id.startsWith('custom-') && !customCardBacks[opt.id]) {
                          return
                        }
                        setDefaultCardBack(game, opt.id)
                        updateAllCardBacks(game, opt.id)
                        setGlobalBackPickerGame(null)
                      }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        padding: 8, borderRadius: 10, cursor: 'pointer',
                        background: isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                    >
                      <div style={{ width: '100%', position: 'relative' }}>
                        <img
                          src={getBackUrl(opt.id)}
                          alt={opt.name}
                          style={{
                            width: '100%',
                            aspectRatio: '63/88',
                            objectFit: 'cover',
                            borderRadius: 6,
                            boxShadow: isSelected ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
                          }}
                        />
                        {opt.id.startsWith('custom-') && (
                          <label
                            htmlFor={`file-global-picker-${opt.id}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                              position: 'absolute', bottom: 4, right: 4, 
                              background: 'rgba(124,58,237,0.9)', borderRadius: 6, 
                              padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 4,
                              cursor: 'pointer', zIndex: 10
                            }}
                          >
                            <svg style={{ width: 10, height: 10, color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span style={{ fontSize: '0.55rem', color: 'white', fontWeight: 800 }}>
                              {customCardBacks[opt.id] ? 'CAMBIAR' : 'SUBIR'}
                            </span>
                          </label>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setZoomedImage(getBackUrl(opt.id))
                          }}
                          style={{
                            position: 'absolute', top: 4, right: 4,
                            width: 24, height: 24, borderRadius: 6,
                            background: 'rgba(0,0,0,0.6)', color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 10, transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.transform = 'scale(1.1)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.transform = 'none' }}
                        >
                          <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </button>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: isSelected ? '#a78bfa' : 'var(--color-text-muted)', textAlign: 'center' }}>
                        {opt.name}
                      </span>
                      {opt.id.startsWith('custom-') && (
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`file-global-picker-${opt.id}`}
                          onClick={e => e.stopPropagation()}
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) handleCustomBackUpload(opt.id, file, e.target, globalBackPickerGame || undefined)
                          }}
                        />
                      )}
                      {isSelected && <span style={{ fontSize: '0.6rem', color: '#7c3aed', fontWeight: 700 }}>✓ Seleccionado</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Ratio Warning Modal */}
      {ratioWarning && (
        <div
          onClick={ratioWarning.onCancel}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="p-8 rounded-2xl border relative overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(245, 158, 11, 0.1)',
              animation: 'panel-card-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Aviso de Proporciones</h3>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {ratioWarning.msg}
              <br /><br />
              ¿Deseas continuar de todos modos?
            </p>
            <div className="flex gap-4">
              <button
                onClick={ratioWarning.onCancel}
                className="flex-1 py-3 rounded-xl font-bold transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Cancelar
              </button>
              <button
                onClick={ratioWarning.onConfirm}
                className="flex-1 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ 
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                  color: '#fff', 
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                  border: '1px solid rgba(255,200,100,0.5)'
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Zoom Overlay */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 20000,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.3s ease',
            cursor: 'zoom-out'
          }}
        >
          <img
            src={zoomedImage}
            alt="Zoom"
            style={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              borderRadius: 12,
              boxShadow: '0 0 50px rgba(124,58,237,0.3)',
              animation: 'zoomInCard 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both'
            }}
          />
          <button
            onClick={() => setZoomedImage(null)}
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: 'none', fontSize: '1.2rem', cursor: 'pointer'
            }}
          >✕</button>
        </div>
      )}
    </div>
  )
}

function CardImage({ imageUrl, game, name, onClick }: { imageUrl: string; game: string; name?: string; onClick?: () => void }) {
  const [broken, setBroken] = useState(false)
  const gradient = GAME_GRADIENT[game] ?? 'linear-gradient(135deg, #1a1a35, #2d2d4e)'

  useEffect(() => {
    setBroken(false)
  }, [imageUrl])

  const baseStyle: React.CSSProperties = {
    width: '90px',
    aspectRatio: '63/88',
    borderRadius: '6px',
    flexShrink: 0,
    overflow: 'hidden',
    cursor: onClick ? 'zoom-in' : 'default',
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
      onClick={onClick}
      className="card-thumb"
      style={{ ...baseStyle, objectFit: 'contain' }}
    />
  )
}
