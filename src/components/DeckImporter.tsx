'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { parseDecklist, ParsedDeckEntry } from '@/lib/deckParser'
import { resolveEntries } from '@/lib/scryfallResolver'
import { SearchResult, groupResults, CardGroup } from '@/lib/cardSearchApi'
import { TCGGame } from '@/types/card'

export interface DeckPrint {
  print: SearchResult
  quantity: number
}

interface DeckImporterProps {
  /** Called when resolved MTG prints are ready to be added to cart */
  onAddPrints: (items: DeckPrint[]) => Promise<void>
}

type Mode = 'paste' | 'url' | 'sets'

interface ScryfallSet {
  code: string
  name: string
  released_at: string
  card_count: number
  icon_svg_uri: string
  set_type: string
}

const ACCENT = '#7c3aed'

export default function DeckImporter({ onAddPrints }: DeckImporterProps) {
  const [mode, setMode] = useState<Mode>('paste')

  return (
    <div className="space-y-5">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'paste' as Mode, label: 'Pegar lista', icon: '📋' as string | null, img: null as string | null },
          { key: 'url'   as Mode, label: 'Importar URL', icon: '🔗' as string | null, img: null as string | null },
          { key: 'sets'  as Mode, label: 'Explorar sets', icon: null as string | null, img: '/Images/TCGs/MTGSets.png' as string | null },
        ]).map(m => {
          const active = mode === m.key
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 12,
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                border: `1px solid ${active ? `${ACCENT}88` : 'rgba(255,255,255,0.08)'}`,
                background: active ? `${ACCENT}22` : 'rgba(255,255,255,0.04)',
                color: active ? ACCENT : 'var(--color-text-muted)',
                boxShadow: active ? `0 4px 16px ${ACCENT}33` : 'none',
                transform: active ? 'translateY(-2px) scale(1.03)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
              onMouseEnter={e => {
                if (mode !== m.key) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
                }
              }}
              onMouseLeave={e => {
                if (mode !== m.key) {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }
              }}
            >
              {m.img
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={m.img} alt="" style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 3, filter: active ? 'none' : 'brightness(0.6) saturate(0.4)', transition: 'filter 0.3s' }} />
                : <span style={{ display: 'inline-block', transition: 'transform 0.25s' }}>{m.icon}</span>
              }
              {m.label}
            </button>
          )
        })}
      </div>

      {mode === 'paste' && <PasteMode onAddPrints={onAddPrints} />}
      {mode === 'url'   && <UrlMode   onAddPrints={onAddPrints} />}
      {mode === 'sets'  && <SetsMode  onAddPrints={onAddPrints} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Shared resolve + import UI block
// ─────────────────────────────────────────────────────────────────
function useImportFlow(onAddPrints: (items: DeckPrint[]) => Promise<void>) {
  const [entries, setEntries] = useState<ParsedDeckEntry[] | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [report, setReport] = useState<{ resolved: DeckPrint[]; failed: Array<{ name: string; reason: string }> } | null>(null)
  const [adding, setAdding] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const resolve = useCallback(async (parsed: ParsedDeckEntry[]) => {
    if (parsed.length === 0) return
    setEntries(parsed)
    setReport(null)
    setProgress({ done: 0, total: parsed.length })
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const { resolved, failed } = await resolveEntries(
      parsed,
      (done, total) => setProgress({ done, total }),
      ctrl.signal,
    )

    const prints: DeckPrint[] = resolved.map(r => ({ print: r.card, quantity: r.entry.quantity }))
    setReport({
      resolved: prints,
      failed: failed.map(f => ({ name: f.entry.name, reason: f.reason })),
    })
    setProgress(null)
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setProgress(null)
    setEntries(null)
  }, [])

  const commit = useCallback(async () => {
    if (!report) return
    setAdding(true)
    try {
      await onAddPrints(report.resolved)
      setReport(null)
      setEntries(null)
    } finally {
      setAdding(false)
    }
  }, [report, onAddPrints])

  const reset = () => {
    setReport(null)
    setEntries(null)
    setProgress(null)
  }

  return { entries, progress, report, adding, resolve, cancel, commit, reset }
}

function ResolveStatus({
  progress,
  report,
  adding,
  onCancel,
  onCommit,
  onReset,
}: {
  progress: { done: number; total: number } | null
  report: { resolved: DeckPrint[]; failed: Array<{ name: string; reason: string }> } | null
  adding: boolean
  onCancel: () => void
  onCommit: () => void
  onReset: () => void
}) {
  if (!progress && !report) return null

  if (progress) {
    const pct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0
    return (
      <div
        className="surface-card p-5 rounded-xl"
        style={{ background: 'var(--color-surface-2)', border: '1px solid rgba(124,58,237,0.3)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold" style={{ color: '#c4b5fd' }}>
            Resolviendo {progress.done}/{progress.total} cartas…
          </span>
          <button
            onClick={onCancel}
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            Cancelar
          </button>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${ACCENT}, #a78bfa)`,
            transition: 'width 0.2s ease',
          }} />
        </div>
      </div>
    )
  }

  if (!report) return null
  const totalCards = report.resolved.reduce((s, r) => s + r.quantity, 0)

  return (
    <div
      className="surface-card p-5 rounded-xl space-y-3"
      style={{ background: 'var(--color-surface-2)', border: '1px solid rgba(124,58,237,0.3)' }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-bold" style={{ color: '#fff' }}>
            {report.resolved.length} línea{report.resolved.length !== 1 ? 's' : ''} resuelta{report.resolved.length !== 1 ? 's' : ''}
            {' '}<span style={{ color: 'var(--color-text-muted)' }}>·</span>{' '}
            <span style={{ color: '#c4b5fd' }}>{totalCards} cartas totales</span>
          </p>
          {report.failed.length > 0 && (
            <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>
              ⚠ {report.failed.length} no encontrada{report.failed.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            disabled={adding}
            className="text-xs font-bold px-4 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', opacity: adding ? 0.5 : 1 }}
          >
            Descartar
          </button>
          <button
            onClick={onCommit}
            disabled={adding || report.resolved.length === 0}
            className="btn-primary text-sm font-bold px-5 py-2"
            style={{ opacity: adding || report.resolved.length === 0 ? 0.5 : 1 }}
          >
            {adding ? 'Añadiendo…' : `Añadir ${totalCards} al carrito →`}
          </button>
        </div>
      </div>

      {report.failed.length > 0 && (
        <details style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 12 }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#fca5a5' }}>
            Ver líneas no encontradas ({report.failed.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {report.failed.slice(0, 50).map((f, i) => (
              <li key={i}>• <span style={{ color: '#fff' }}>{f.name}</span> — {f.reason}</li>
            ))}
            {report.failed.length > 50 && <li>…y {report.failed.length - 50} más</li>}
          </ul>
        </details>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Mode: Paste decklist
// ─────────────────────────────────────────────────────────────────
function PasteMode({ onAddPrints }: { onAddPrints: (items: DeckPrint[]) => Promise<void> }) {
  const [text, setText] = useState('')
  const { progress, report, adding, resolve, cancel, commit, reset } = useImportFlow(onAddPrints)

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    file.text().then(setText)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'], 'text/*': [] },
    multiple: false,
    noClick: true,
  })

  const handleResolve = () => {
    const parsed = parseDecklist(text)
    resolve(parsed)
  }

  const active = !!progress || !!report

  return (
    <div className="space-y-4" {...getRootProps()}>
      <style>{`
        .deck-textarea {
          scrollbar-width: thin;
          scrollbar-color: rgba(124,58,237,0.4) transparent;
        }
        .deck-textarea::-webkit-scrollbar { width: 5px; }
        .deck-textarea::-webkit-scrollbar-track { background: transparent; }
        .deck-textarea::-webkit-scrollbar-thumb {
          background: rgba(124,58,237,0.4);
          border-radius: 99px;
        }
        .deck-textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(124,58,237,0.7);
        }
      `}</style>
      <input {...getInputProps()} />

      <div
        style={{
          position: 'relative',
          border: `1px dashed ${isDragActive ? ACCENT : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 14,
          background: isDragActive ? 'rgba(124,58,237,0.08)' : 'var(--color-surface-2)',
          transition: 'all 0.2s ease',
        }}
      >
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={active}
          placeholder={`Formato MTGA/MTGO — cartas en inglés (los corchetes [Ramp], etiquetas *F* y comentarios # se ignoran):\n\n4 Lightning Bolt\n1 Sol Ring (CMR) 319\n1 Atraxa, Praetors' Voice [Ramp]\n\nSideboard:\n2 Negate\n\n(o arrastra un .txt aquí)`}
          rows={11}
          className="w-full bg-transparent outline-none resize-y deck-textarea"
          style={{
            padding: 16,
            color: 'var(--color-text)',
            fontSize: '0.85rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            lineHeight: 1.6,
            borderRadius: 14,
            minHeight: 240,
          }}
        />
        {isDragActive && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: ACCENT, pointerEvents: 'none',
            background: 'rgba(124,58,237,0.05)', borderRadius: 14,
          }}>
            🎯 Suelta tu .txt aquí
          </div>
        )}
      </div>

      {!active && (
        <div className="flex justify-end">
          <button
            onClick={handleResolve}
            disabled={!text.trim()}
            className="btn-primary px-6 py-2.5 text-sm font-bold"
            style={{ opacity: text.trim() ? 1 : 0.5 }}
          >
            Analizar lista →
          </button>
        </div>
      )}

      <ResolveStatus
        progress={progress}
        report={report}
        adding={adding}
        onCancel={cancel}
        onCommit={commit}
        onReset={reset}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Mode: Import from URL
// ─────────────────────────────────────────────────────────────────
function UrlMode({ onAddPrints }: { onAddPrints: (items: DeckPrint[]) => Promise<void> }) {
  const [url, setUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [moxfieldBlocked, setMoxfieldBlocked] = useState(false)
  const { progress, report, adding, resolve, cancel, commit, reset } = useImportFlow(onAddPrints)

  const active = !!progress || !!report

  const handleFetch = async () => {
    if (!url.trim()) return
    setError(null)
    setMoxfieldBlocked(false)
    setFetching(true)
    try {
      const res = await fetch('/api/deck-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.moxfieldBlocked) {
        setMoxfieldBlocked(true)
        setError(data.error)
        return
      }
      if (data.error) {
        setError(data.error)
        return
      }
      if (!data.entries?.length) {
        setError('El mazo está vacío.')
        return
      }
      resolve(data.entries)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al contactar con el servidor')
    } finally {
      setFetching(false)
    }
  }

  return (
    <div className="space-y-4">
      <div style={{ position: 'relative' }}>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={fetching || active}
          placeholder="https://archidekt.com/decks/... · mtggoldfish.com/deck/... · tappedout.net/..."
          style={{
            width: '100%',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 14,
            padding: '14px 16px',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Soportados: <span style={{ color: '#c4b5fd' }}>Archidekt</span>, <span style={{ color: '#c4b5fd' }}>MTGGoldfish</span>, <span style={{ color: '#c4b5fd' }}>TappedOut</span>, <span style={{ color: '#c4b5fd' }}>Scryfall</span>
        </p>
        {!active && (
          <button
            onClick={handleFetch}
            disabled={!url.trim() || fetching}
            className="btn-primary px-6 py-2.5 text-sm font-bold"
            style={{ opacity: !url.trim() || fetching ? 0.5 : 1 }}
          >
            {fetching ? 'Descargando…' : 'Importar mazo →'}
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background: moxfieldBlocked ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${moxfieldBlocked ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: moxfieldBlocked ? '#fcd34d' : '#fca5a5',
            fontSize: '0.85rem',
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: 4 }}>
            {moxfieldBlocked ? '⚠ Moxfield no permite importación automática' : '⚠ Error'}
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
          {moxfieldBlocked && (
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Abre el mazo en Moxfield → menú <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>More → Export</code> → copia el texto → pégalo en la pestaña <strong style={{ color: '#c4b5fd' }}>Pegar lista</strong>.
            </p>
          )}
        </div>
      )}

      <ResolveStatus
        progress={progress}
        report={report}
        adding={adding}
        onCancel={cancel}
        onCommit={commit}
        onReset={reset}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Mode: Browse by set
// ─────────────────────────────────────────────────────────────────
function SetsMode({ onAddPrints }: { onAddPrints: (items: DeckPrint[]) => Promise<void> }) {
  const [sets, setSets] = useState<ScryfallSet[] | null>(null)
  const [selectedSet, setSelectedSet] = useState<string | null>(null)
  const [setFilter, setSetFilter] = useState('')
  const [cards, setCards] = useState<SearchResult[] | null>(null)
  const [loadingCards, setLoadingCards] = useState(false)
  const [preview, setPreview] = useState<SearchResult | null>(null)
  const [adding, setAdding] = useState(false)
  const [variantPicker, setVariantPicker] = useState<CardGroup | null>(null)
  const setGroups = cards ? groupResults(cards, 'mtg') : null

  useEffect(() => {
    if (!preview) return
    const prev = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`
    return () => {
      document.body.style.overflow = prev
      document.body.style.paddingRight = prevPad
    }
  }, [preview])

  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        const res = await fetch('https://api.scryfall.com/sets', { headers: { 'Accept': 'application/json' } })
        if (!res.ok) return
        const data = await res.json()
        if (aborted) return
        const keep = new Set(['expansion', 'core', 'commander', 'draft_innovation', 'masters'])
        type ScryfallSetRaw = ScryfallSet & { digital?: boolean }
        const filtered: ScryfallSet[] = ((data.data ?? []) as ScryfallSetRaw[])
          .filter(s => keep.has(s.set_type) && s.card_count > 0 && !s.digital)
          .map(s => ({
            code: s.code,
            name: s.name,
            released_at: s.released_at,
            card_count: s.card_count,
            icon_svg_uri: s.icon_svg_uri,
            set_type: s.set_type,
          }))
        setSets(filtered)
      } catch (err) {
        console.error('Failed to load sets:', err)
      }
    })()
    return () => { aborted = true }
  }, [])

  const loadSetCards = async (code: string) => {
    setSelectedSet(code)
    setCards(null)
    setLoadingCards(true)
    try {
      const url = `https://api.scryfall.com/cards/search?q=e%3A${encodeURIComponent(code)}&unique=prints&order=collector`
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
      if (!res.ok) { setCards([]); return }
      const data = await res.json()
      type ImgUris = { png?: string; large?: string; normal?: string; small?: string }
      interface ScryfallCardRaw {
        id: string
        name: string
        set: string
        set_name: string
        oracle_id: string
        collector_number: string
        image_uris?: ImgUris
        card_faces?: Array<{ image_uris?: ImgUris }>
      }
      const mapped: SearchResult[] = ((data.data ?? []) as ScryfallCardRaw[]).map(c => ({
        key: c.id,
        name: c.name,
        set: `${c.set_name} (${c.set?.toUpperCase()})`,
        imageUrl: c.image_uris?.png || c.image_uris?.large || c.image_uris?.normal || c.card_faces?.[0]?.image_uris?.png || '',
        imageUrlSmall: c.image_uris?.small || c.image_uris?.normal || c.card_faces?.[0]?.image_uris?.small || '',
        game: 'mtg' as TCGGame,
        oracleId: c.oracle_id,
        setCode: c.set,
        collectorNumber: c.collector_number,
      })).filter((r: SearchResult) => r.imageUrl)
      setCards(mapped)
    } finally {
      setLoadingCards(false)
    }
  }

  const handleAdd = async (r: SearchResult) => {
    setAdding(true)
    try {
      await onAddPrints([{ print: r, quantity: 1 }])
      setPreview(null)
    } finally {
      setAdding(false)
    }
  }

  const visibleSets = sets?.filter(s => {
    if (!setFilter) return true
    const q = setFilter.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
  })

  if (!sets) {
    return (
      <div className="space-y-3">
        <style>{`
          @keyframes sk-shimmer {
            0%   { background-position: -600px 0; }
            100% { background-position: 600px 0; }
          }
          .sk {
            background: linear-gradient(90deg,
              rgba(255,255,255,0.04) 0%,
              rgba(255,255,255,0.09) 40%,
              rgba(124,58,237,0.08) 50%,
              rgba(255,255,255,0.09) 60%,
              rgba(255,255,255,0.04) 100%
            );
            background-size: 1200px 100%;
            animation: sk-shimmer 1.8s ease-in-out infinite;
          }
        `}</style>

        {/* Fake search input */}
        <div className="sk" style={{ height: 44, borderRadius: 12 }} />

        {/* Fake set rows */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: 'var(--color-surface-2)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 10,
                animationDelay: `${i * 0.06}s`,
              }}
            >
              {/* Icon circle */}
              <div className="sk" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
              {/* Text lines */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="sk" style={{ height: 11, borderRadius: 6, width: `${55 + (i * 13) % 30}%`, animationDelay: `${i * 0.06 + 0.1}s` }} />
                <div className="sk" style={{ height: 9,  borderRadius: 6, width: `${35 + (i * 7)  % 25}%`, animationDelay: `${i * 0.06 + 0.2}s`, opacity: 0.6 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!selectedSet) {
    return (
      <div className="space-y-3">
        <input
          type="text"
          value={setFilter}
          onChange={e => setSetFilter(e.target.value)}
          placeholder="Filtrar por nombre o código de set…"
          style={{
            width: '100%',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
        <div
          className="grid gap-2 scrollbar-thin"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            maxHeight: 520,
            overflowY: 'auto',
            paddingRight: 6,
          }}
        >
          {(visibleSets ?? []).map(s => (
            <button
              key={s.code}
              onClick={() => loadSetCards(s.code)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: 'var(--color-surface-2)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${ACCENT}88`
                e.currentTarget.style.background = `${ACCENT}14`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.background = 'var(--color-surface-2)'
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.icon_svg_uri} alt="" style={{ width: 28, height: 28, filter: 'invert(1) brightness(1.1)', flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="text-sm font-bold truncate" style={{ color: '#fff' }}>{s.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {s.code.toUpperCase()} · {s.card_count} cartas · {s.released_at?.slice(0, 4)}
                </p>
              </div>
            </button>
          ))}
          {visibleSets?.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
              Sin resultados.
            </p>
          )}
        </div>
      </div>
    )
  }

  const setInfo = sets.find(s => s.code === selectedSet)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => { setSelectedSet(null); setCards(null); setVariantPicker(null) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
            padding: '6px 12px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-text-muted)',
            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${ACCENT}18`
            e.currentTarget.style.borderColor = `${ACCENT}55`
            e.currentTarget.style.color = '#c4b5fd'
            e.currentTarget.style.transform = 'translateX(-3px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = 'var(--color-text-muted)'
            e.currentTarget.style.transform = 'none'
          }}
        >
          ← Volver a sets
        </button>
        <p className="text-sm font-bold" style={{ color: '#fff' }}>
          {setInfo?.name ?? selectedSet.toUpperCase()}
          {setGroups && <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}> · {setGroups.length} cartas</span>}
        </p>
      </div>

      {loadingCards && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Cargando cartas del set…</p>
      )}

      {setGroups && (
        <div
          className="grid gap-2 scrollbar-thin"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            maxHeight: 520,
            overflowY: 'auto',
            paddingRight: 6,
          }}
        >
          {setGroups.map(g => {
            const c = g.display
            const multi = g.prints.length > 1
            return (
              <div
                key={g.groupId}
                onClick={() => multi ? setVariantPicker(g) : setPreview(c)}
                style={{
                  position: 'relative',
                  aspectRatio: '63/88',
                  borderRadius: 10,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'var(--color-surface-3)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'
                  e.currentTarget.style.borderColor = `${ACCENT}88`
                  e.currentTarget.style.boxShadow = `0 10px 30px ${ACCENT}44`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                title={multi ? `${c.name} — ${g.prints.length} variantes` : `${c.name} · #${c.collectorNumber}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imageUrlSmall} alt={c.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {multi && (
                  <div style={{
                    position: 'absolute', top: 5, left: 5,
                    padding: '2px 7px', borderRadius: 7,
                    fontSize: '0.6rem', fontWeight: 800,
                    background: `linear-gradient(135deg, ${ACCENT}ee, ${ACCENT}aa)`,
                    color: '#fff', boxShadow: `0 2px 8px ${ACCENT}66`,
                    pointerEvents: 'none', zIndex: 2,
                  }}>
                    {g.prints.length} vars
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {variantPicker && (
        <div
          onClick={() => setVariantPicker(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999998,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, animation: 'fadeIn 0.18s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 560, width: '100%',
              background: 'var(--color-surface-2)',
              border: `1px solid ${ACCENT}44`,
              borderRadius: 16, padding: 20,
              animation: 'panel-card-in 0.3s cubic-bezier(0.2,0.8,0.2,1) both',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{variantPicker.display.name}</p>
              <button
                onClick={() => setVariantPicker(null)}
                style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
              {variantPicker.prints.length} variantes — elige cuál quieres añadir
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
              {variantPicker.prints.map(p => (
                <div
                  key={p.key}
                  onClick={() => { setVariantPicker(null); setPreview(p) }}
                  style={{ aspectRatio: '63/88', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'; e.currentTarget.style.borderColor = `${ACCENT}88`; e.currentTarget.style.boxShadow = `0 8px 24px ${ACCENT}44` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                  title={`${p.set} · #${p.collectorNumber}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrlSmall} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div
          onClick={() => !adding && setPreview(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            animation: 'fadeIn 0.18s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 360, width: '100%', position: 'relative',
              animation: 'panel-card-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.imageUrl}
              alt={preview.name}
              style={{
                width: '100%',
                borderRadius: 12,
                boxShadow: `0 0 60px ${ACCENT}55`,
                display: 'block',
              }}
            />
            <div className="mt-3 text-center">
              <p className="text-sm font-bold text-white">{preview.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {preview.set}{preview.collectorNumber ? ` · #${preview.collectorNumber}` : ''}
              </p>
              <button
                onClick={() => handleAdd(preview)}
                disabled={adding}
                className="btn-primary mt-4 px-6 py-2.5 text-sm font-bold"
                style={{ boxShadow: `0 4px 20px ${ACCENT}44`, opacity: adding ? 0.6 : 1 }}
              >
                {adding ? 'Añadiendo…' : '+ Añadir al carrito'}
              </button>
            </div>
            <button
              onClick={() => setPreview(null)}
              disabled={adding}
              style={{
                position: 'absolute', top: '-12px', right: '-12px',
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(30,20,50,0.95)',
                border: `1px solid ${ACCENT}66`,
                color: '#fff', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: adding ? 'not-allowed' : 'pointer',
                opacity: adding ? 0.5 : 1,
              }}
              aria-label="Cerrar"
            >✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
