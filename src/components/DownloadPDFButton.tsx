'use client'

import { useEffect, useRef, useState } from 'react'
import { useCartStore } from '@/lib/cartStore'
import { useFileStore } from '@/lib/fileStore'
import { useClientPDF } from '@/lib/useClientPDF'

const MSGS = [
  'Invocando criaturas al campo de batalla...',
  'El mago está lanzando su hechizo...',
  'Pikachu cargando energía...',
  'Dragón Blanco de Ojos Azules en preparación...',
  'Barajando el mazo de impresión...',
  'Aplicando el acabado foil...',
  'Calculando marcas de corte...',
  'Activando trampa continua...',
  'El oráculo consulta las cartas...',
  'Preparando el deck para el torneo...',
  'Colocando las cartas en la hoja A4...',
  'Añadiendo brillo a los holográficos...',
  'Mezclando tinta mágica...',
  'El instructor Pokémon revisa la calidad...',
  'Escribiendo el grimorio de impresión...',
]

const INTERVAL = 3000
const FADE_MS  = 280

function pickOther(current: number) {
  let n
  do { n = Math.floor(Math.random() * MSGS.length) } while (n === current)
  return n
}

export default function DownloadPDFButton() {
  const cards    = useCartStore(s => s.cards)
  const files    = useFileStore(s => s.files)
  const { generate, generating, error } = useClientPDF()

  const [msgIndex,    setMsgIndex]    = useState(0)
  const [textVisible, setTextVisible] = useState(true)

  // fill bar ref — width & animation set imperatively so React never touches them
  const fillRef  = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reflow trick: the only reliable way to restart a CSS animation mid-element
  const restartFill = () => {
    const el = fillRef.current
    if (!el) return
    el.style.animation = 'none'
    void el.offsetWidth                                          // force reflow
    el.style.animation = `pdf-fill ${INTERVAL}ms linear forwards`
  }

  useEffect(() => {
    if (!generating) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      setTextVisible(true)
      return
    }

    setMsgIndex(Math.floor(Math.random() * MSGS.length))
    setTextVisible(true)

    // small delay so the fill element is committed to the DOM before we animate it
    const startTimeout = setTimeout(() => {
      restartFill()

      timerRef.current = setInterval(() => {
        setTextVisible(false)
        setTimeout(() => {
          setMsgIndex(i => pickOther(i))
          setTextVisible(true)
          restartFill()
        }, FADE_MS)
      }, INTERVAL)
    }, 50)

    return () => {
      clearTimeout(startTimeout)
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generating])

  const hasFiles = cards.every(c => files.has(c.id))
  if (!hasFiles) return null

  return (
    <div className="space-y-2">
      <button
        onClick={() => generate(cards, files)}
        disabled={generating}
        className="w-full rounded-xl font-bold relative overflow-hidden"
        style={{
          border: '2px solid #7c3aed',
          background: 'rgba(124,58,237,0.05)',
          minHeight: '48px',
          padding: '0 16px',
          cursor: generating ? 'default' : 'pointer',
        }}
      >
        {/* Fill bar — width & animation NOT in style prop so React never resets them */}
        {generating && (
          <div
            ref={fillRef}
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: '100%',
              background: 'linear-gradient(90deg, #5b21b6, #7c3aed, #a78bfa)',
              pointerEvents: 'none',
              transformOrigin: 'left',
              // animation is set imperatively via restartFill()
            }}
          />
        )}

        {/* Text — always above the fill */}
        <span
          style={{
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            color: generating ? '#fff' : '#a78bfa',
            fontSize: generating ? '0.8rem' : '0.875rem',
            fontWeight: 700,
            opacity: textVisible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease`,
          }}
        >
          {generating && <Spinner />}
          {generating ? MSGS[msgIndex] : '⬇ Descargar PDF de impresión'}
        </span>
      </button>

      {error && (
        <p className="text-xs" style={{ color: 'var(--color-danger)' }}>⚠ {error}</p>
      )}

      <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
        PDF A4 · 9 cartas por hoja · Con marcas de corte
      </p>
    </div>
  )
}

function Spinner() {
  return (
    <span style={{
      flexShrink: 0, width: '13px', height: '13px',
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.35)',
      borderTopColor: '#fff',
      display: 'inline-block',
      animation: 'spin 0.75s linear infinite',
    }} />
  )
}
