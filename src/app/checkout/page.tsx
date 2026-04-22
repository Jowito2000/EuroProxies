'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/cartStore'
import PriceCalculator from '@/components/PriceCalculator'
import { useRestoreCartImages } from '@/lib/useRestoreCartImages'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import { getCountryByCode } from '@/utils/countries'
import { useAuth } from '@/components/AuthProvider'
import { useClientPDF } from '@/lib/useClientPDF'
import { useFileStore } from '@/lib/fileStore'

export default function CheckoutPage() {
  const router = useRouter()
  const cards = useCartStore(s => s.cards)
  const total = useCartStore(s => s.total())
  const totalCards = useCartStore(s => s.totalCards())

  const [mounted, setMounted] = useState(false)
  const shippingDetails = useCartStore(s => s.shippingDetails)
  const shippingCountryCode = useCartStore(s => s.shippingCountry)
  const currentCountry = getCountryByCode(shippingCountryCode)

  const { user } = useAuth()
  const { generate } = useClientPDF()
  const files = useFileStore(s => s.files)

  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [emailError, setEmailError] = useState('')

  useRestoreCartImages()

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

  const fullAddress = `${shippingDetails.address}, Nº ${shippingDetails.number}` +
    (shippingDetails.floor ? `, Piso ${shippingDetails.floor}` : '') +
    (shippingDetails.door ? `, Puerta ${shippingDetails.door}` : '') +
    `<br />${shippingDetails.city}, ${shippingDetails.province}`

  const displayPhone = shippingDetails.phone.startsWith('+') 
    ? shippingDetails.phone 
    : `${shippingDetails.phonePrefix} ${shippingDetails.phone}`

  const processEmailAndRedirect = async (email: string) => {
    setIsProcessing(true)
    setEmailError('')
    try {
      // 1. Generate PDF (headless) with compression enabled and cover page
      const orderDetailsObj = {
        totalCards,
        subtotal: useCartStore.getState().subtotal(),
        shippingCost: useCartStore.getState().shippingCost(),
        total,
        shippingDetails,
        cards,
      }
      const pdfBytes = await generate(cards, files, true, true, orderDetailsObj)
      if (!pdfBytes) throw new Error('Error al generar el PDF')
      
      // 2. Convert to Base64
      const base64 = await new Promise<string>((resolve) => {
        const blob = new Blob([new Uint8Array(pdfBytes.buffer.slice(0))])
        const reader = new FileReader()
        reader.onloadend = () => {
          const b64 = (reader.result as string).split(',')[1]
          resolve(b64)
        }
        reader.readAsDataURL(blob)
      })

      // 3. Send email
      const res = await fetch('/api/orders/email-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pdfBase64: base64,
          orderDetails: orderDetailsObj
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Error enviando el correo de resumen');
      }

      // 4. Redirect
      router.push('/mantenimiento')
    } catch (err) {
      console.error(err)
      setEmailError(err instanceof Error ? err.message : 'Hubo un problema procesando tu petición. Inténtalo de nuevo.')
      setIsProcessing(false)
    }
  }

  const handlePayClick = async () => {
    if (user && user.email) {
      await processEmailAndRedirect(user.email)
    } else {
      setShowEmailModal(true)
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

      {/* Shipping Details Summary */}
      <div className="surface-card p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg" style={{ color: '#fff' }}>Dirección de entrega</h2>
          <button onClick={() => router.push('/cart')} className="text-sm font-semibold text-purple-400 hover:text-purple-300 underline">
            Editar
          </button>
        </div>
        
        <div className="space-y-2 text-sm" style={{ color: 'var(--color-text)' }}>
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <strong className="text-white">{shippingDetails.fullName}</strong>
          </p>
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {displayPhone}
          </p>
          <p className="flex items-start gap-2 mt-2 pt-2 border-t border-white/5">
            <svg className="w-4 h-4 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              <span dangerouslySetInnerHTML={{ __html: fullAddress }} />
              <span className="flex items-center gap-2 mt-1">
                {currentCountry && <img src={currentCountry.iconUrl} alt={currentCountry.label} className="w-5 h-auto rounded-[2px]" />}
                {currentCountry?.label}
              </span>
            </span>
          </p>
        </div>
      </div>

      {/* Card summary */}
      <div className="surface-card p-5 mb-6">
        <h2 className="font-bold mb-4" style={{ color: '#fff' }}>
          Resumen — {totalCards} carta{totalCards !== 1 ? 's' : ''}
        </h2>
        <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin pr-3">
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

      <button
        onClick={handlePayClick}
        disabled={isProcessing && !showEmailModal}
        className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50"
      >
        {(isProcessing && !showEmailModal) ? 'Procesando...' : `Pagar ${total.toFixed(2)} € →`}
      </button>

      {/* Modals and Overlays */}
      {showEmailModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div className="surface-card p-6 w-full max-w-sm" style={{ animation: 'panel-card-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}>
            <h3 className="font-bold text-lg text-white mb-2">Resumen de tu pedido</h3>
            <p className="text-sm text-gray-400 mb-4">
              Introduce tu correo electrónico para enviarte el resumen del pedido junto con el PDF de las cartas generadas antes de proceder al pago.
            </p>
            <input
              type="email"
              placeholder="tu@email.com"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 mb-2"
              disabled={isProcessing}
            />
            {emailError && <p className="text-red-400 text-xs mb-3 font-semibold">{emailError}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border border-white/10 hover:bg-white/5 transition-colors text-white"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!emailInput.includes('@')) setEmailError('Introduce un correo válido')
                  else { setEmailError(''); processEmailAndRedirect(emailInput) }
                }}
                className="btn-primary flex-1 py-2 rounded-xl text-sm font-bold disabled:opacity-50 flex justify-center items-center gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* If logged in and processing, show a fullscreen spinner overlay so they know it's working */}
      {isProcessing && !showEmailModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-purple-600 animate-spin mb-6"></div>
          <p className="text-white font-bold animate-pulse">Generando PDF y preparando correo...</p>
        </div>
      )}
    </div>
  )
}
