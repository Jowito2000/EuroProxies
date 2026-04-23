'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { SearchResult, searchCards } from '@/lib/cardSearchApi'
import { TCGGame } from '@/types/card'

const GAME_LABELS: Record<string, string> = {
  mtg: 'Magic: The Gathering',
  pokemon: 'Pokémon TCG',
  yugioh: 'Yu-Gi-Oh!',
  lorcana: 'Disney Lorcana',
}

const GAME_ICONS: Record<string, string> = {
  mtg: '/images/TCGs/MTGIcon.png',
  pokemon: '/images/TCGs/PokemonIcon.png',
  yugioh: '/images/TCGs/YuGiOhIcon.png',
  lorcana: '/images/TCGs/LorcanaIcon.png',
}

const GAME_COLORS: Record<string, string> = {
  mtg: '#7c3aed',
  pokemon: '#eab308',
  yugioh: '#3b82f6',
  lorcana: '#06b6d4',
}

interface CardSearchProps {
  onSelect: (result: SearchResult) => void
}

export default function CardSearch({ onSelect }: CardSearchProps) {
  const [game, setGame] = useState<TCGGame>('mtg')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [previewCard, setPreviewCard] = useState<SearchResult | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const accentColor = GAME_COLORS[game] ?? '#7c3aed'

  const doSearch = useCallback(async (q: string, g: TCGGame) => {
    if (q.length < 2) {
      setResults([])
      setHasSearched(false)
      return
    }
    setLoading(true)
    setHasSearched(true)
    try {
      const r = await searchCards(q, g)
      setResults(r)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value, game), 350)
  }

  const handleGameChange = (g: TCGGame) => {
    setGame(g)
    setResults([])
    setHasSearched(false)
    if (query.length >= 2) {
      doSearch(query, g)
    }
  }

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  return (
    <div className="cs-root space-y-5">
      <style>{`
        /* ── Game selector pills ── */
        .cs-game-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: var(--color-text-muted);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cs-game-pill:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.07);
        }
        .cs-game-pill.active {
          transform: translateY(-2px) scale(1.03);
        }
        .cs-game-icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
          border-radius: 4px;
          transition: transform 0.3s ease;
        }
        .cs-game-pill:hover .cs-game-icon,
        .cs-game-pill.active .cs-game-icon {
          transform: scale(1.15);
        }

        /* ── Search input ── */
        .cs-input {
          width: 100%;
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          border-radius: 14px;
          padding: 14px 46px 14px 16px;
          font-size: 0.9rem;
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
          outline: none;
        }
        .cs-input:focus {
          transform: translateY(-1px);
        }
        .cs-input::placeholder {
          color: var(--color-text-muted);
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }
        .cs-input:focus::placeholder {
          opacity: 0.3;
        }

        /* ── Spinner ── */
        .cs-spinner {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: inherit;
          animation: spin 0.8s linear infinite;
          pointer-events: none;
        }

        /* ── Result count badge ── */
        .cs-count {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
          animation: cs-fade-slide-in 0.35s ease both;
        }

        /* ── Results grid ── */
        .cs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 10px;
          max-height: 460px;
          overflow-y: auto;
          padding-right: 6px;
          scrollbar-width: thin;
          scrollbar-color: rgba(124,58,237,0.35) transparent;
          scrollbar-gutter: stable;
        }
        .cs-grid::-webkit-scrollbar {
          width: 5px;
        }
        .cs-grid::-webkit-scrollbar-track {
          background: transparent;
        }
        .cs-grid::-webkit-scrollbar-thumb {
          background: rgba(124,58,237,0.35);
          border-radius: 99px;
          transition: background 0.2s;
        }
        .cs-grid::-webkit-scrollbar-thumb:hover {
          background: rgba(124,58,237,0.6);
        }

        /* ── Individual card result ── */
        .cs-card {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.06);
          background: var(--color-surface-3);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          animation: cs-card-pop 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .cs-card:hover {
          transform: translateY(-6px) scale(1.04);
          border-color: rgba(124,58,237,0.5);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 24px rgba(124,58,237,0.2);
          z-index: 2;
        }
        .cs-card:active {
          transform: translateY(-2px) scale(0.98);
          transition-duration: 0.1s;
        }
        .cs-card img.cs-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .cs-card:hover img.cs-card-img {
          transform: scale(1.06);
        }

        /* ── Hover overlay ── */
        .cs-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 40%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 8px;
        }
        .cs-card:hover .cs-card-overlay {
          opacity: 1;
        }

        /* ── Zoom + Add buttons ── */
        .cs-card-actions {
          position: absolute;
          top: 6px;
          right: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          opacity: 0;
          transform: translateX(8px);
          transition: all 0.25s ease;
          z-index: 3;
        }
        .cs-card:hover .cs-card-actions {
          opacity: 1;
          transform: translateX(0);
        }
        .cs-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          backdrop-filter: blur(6px);
        }
        .cs-action-btn:hover {
          transform: scale(1.15);
        }
        .cs-action-btn:active {
          transform: scale(0.9);
        }
        .cs-zoom-btn {
          background: rgba(0,0,0,0.7);
          color: #fff;
        }
        .cs-zoom-btn:hover {
          background: rgba(124,58,237,0.8);
          box-shadow: 0 0 12px rgba(124,58,237,0.4);
        }

        /* ── No results ── */
        .cs-no-results {
          text-align: center;
          padding: 32px 0;
          color: var(--color-text-muted);
          font-size: 0.85rem;
          animation: cs-fade-slide-in 0.3s ease both;
        }

        /* ── Animations ── */
        @keyframes cs-fade-slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cs-card-pop {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to   { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>

      {/* Game selector pills */}
      <div className="flex flex-wrap gap-2">
        {(['mtg', 'pokemon', 'yugioh', 'lorcana'] as TCGGame[]).map(g => {
          const isActive = game === g
          const gColor = GAME_COLORS[g]
          return (
            <button
              key={g}
              onClick={() => handleGameChange(g)}
              className={`cs-game-pill ${isActive ? 'active' : ''}`}
              style={{
                ...(isActive ? {
                  background: `${gColor}22`,
                  borderColor: `${gColor}88`,
                  color: gColor === '#eab308' ? '#fde047' : gColor,
                  boxShadow: `0 4px 16px ${gColor}33`,
                } : {}),
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={GAME_ICONS[g]} alt="" className="cs-game-icon" />
              {GAME_LABELS[g]}
            </button>
          )
        })}
      </div>

      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder={`Buscar cartas de ${GAME_LABELS[game]}...`}
          className="cs-input"
          style={{
            borderColor: query ? `${accentColor}55` : undefined,
            boxShadow: query ? `0 0 0 3px ${accentColor}15, 0 4px 16px ${accentColor}10` : undefined,
          }}
        />
        {loading && <span className="cs-spinner" style={{ borderTopColor: accentColor }} />}
      </div>

      {/* Results */}
      {hasSearched && !loading && results.length === 0 && (
        <div className="cs-no-results">
          No se encontraron cartas para &quot;{query}&quot;
        </div>
      )}

      {results.length > 0 && (
        <div>
          <p className="cs-count mb-3">
            {results.length} resultado{results.length !== 1 ? 's' : ''} · Haz clic en una carta para añadirla
          </p>
          <div className="cs-grid">
            {results.map((r, i) => (
              <div
                key={r.key}
                className="cs-card"
                onClick={() => onSelect(r)}
                style={{
                  aspectRatio: game === 'yugioh' ? '59/86' : '63/88',
                  animationDelay: `${Math.min(i * 30, 600)}ms`,
                }}
                title={`${r.name}\n${r.set}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.imageUrlSmall}
                  alt={r.name}
                  loading="lazy"
                  className="cs-card-img"
                />

                {/* Action buttons (zoom) */}
                <div className="cs-card-actions">
                  <button
                    className="cs-action-btn cs-zoom-btn"
                    onClick={(e) => { e.stopPropagation(); setPreviewCard(r) }}
                    title="Hacer zoom"
                  >
                    🔍
                  </button>
                </div>

                {/* Bottom info overlay */}
                <div className="cs-card-overlay">
                  <p className="text-[0.6rem] font-bold text-white leading-tight truncate">{r.name}</p>
                  <p className="text-[0.5rem] truncate" style={{ color: `${accentColor}cc` }}>{r.set}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zoom preview modal */}
      {previewCard && (
        <div
          onClick={() => setPreviewCard(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.18s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 360, width: '100%',
              animation: 'panel-card-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewCard.imageUrl}
              alt={previewCard.name}
              style={{
                width: '100%',
                borderRadius: 12,
                boxShadow: `0 0 60px ${accentColor}55`,
                display: 'block',
              }}
            />
            <div className="mt-3 text-center">
              <p className="text-sm font-bold text-white">{previewCard.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{previewCard.set}</p>
              <button
                onClick={() => { onSelect(previewCard); setPreviewCard(null) }}
                className="btn-primary mt-4 px-6 py-2.5 text-sm font-bold"
                style={{ boxShadow: `0 4px 20px ${accentColor}44` }}
              >
                + Añadir al carrito
              </button>
            </div>
            <button
              onClick={() => setPreviewCard(null)}
              style={{
                position: 'absolute', top: '-12px', right: '-12px',
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(30,20,50,0.95)',
                border: '1px solid rgba(124,58,237,0.4)',
                color: '#fff', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.transform = 'scale(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,20,50,0.95)'; e.currentTarget.style.transform = 'none' }}
              aria-label="Cerrar"
            >✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
