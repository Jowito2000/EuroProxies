'use client'

import { useEffect } from 'react'
import { CardGroup, SearchResult } from '@/lib/cardSearchApi'

interface VersionPickerProps {
  group: CardGroup
  accentColor?: string
  onClose: () => void
  onPick: (print: SearchResult) => void
}

export default function VersionPicker({ group, accentColor = '#7c3aed', onClose, onPick }: VersionPickerProps) {
  useEffect(() => {
    const prev = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`
    return () => {
      document.body.style.overflow = prev
      document.body.style.paddingRight = prevPad
    }
  }, [])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999998,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 880,
          width: '100%',
          maxHeight: '88vh',
          background: 'var(--color-surface)',
          border: `1px solid ${accentColor}55`,
          borderRadius: 16,
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 60px ${accentColor}33`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'panel-card-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>
              {group.display.name}
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', margin: '2px 0 0' }}>
              Haz clic en una impresión para verla · {group.prints.length} versiones
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Cerrar"
          >✕</button>
        </div>

        <div
          className="scrollbar-thin"
          style={{
            padding: 18,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 12,
          }}
        >
          {group.prints.map((p, i) => (
            <div
              key={p.key}
              onClick={() => onPick(p)}
              className="cs-card"
              style={{
                aspectRatio: '63/88',
                animationDelay: `${Math.min(i * 25, 400)}ms`,
              }}
              title={`${p.name}\n${p.set}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imageUrlSmall}
                alt={p.name}
                loading="lazy"
                className="cs-card-img"
              />
              <div
                className="cs-card-overlay"
                style={{
                  opacity: 1,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 70%)',
                }}
              >
                <p className="text-[0.62rem] font-bold text-white leading-tight truncate">{p.set}</p>
                {p.collectorNumber && (
                  <p className="text-[0.5rem] truncate" style={{ color: `${accentColor}cc` }}>#{p.collectorNumber}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
