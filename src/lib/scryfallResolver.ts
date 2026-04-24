'use client'

import { ParsedDeckEntry } from '@/lib/deckParser'
import { SearchResult } from '@/lib/cardSearchApi'
import { TCGGame } from '@/types/card'

export interface ResolvedEntry {
  entry: ParsedDeckEntry
  card: SearchResult
}

export interface ResolveReport {
  resolved: ResolvedEntry[]
  failed: Array<{ entry: ParsedDeckEntry; reason: string }>
}

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

function scryfallToResult(c: ScryfallCardRaw): SearchResult | null {
  const imageUrl = c.image_uris?.png || c.image_uris?.large || c.image_uris?.normal || c.card_faces?.[0]?.image_uris?.png || ''
  const imageUrlSmall = c.image_uris?.small || c.image_uris?.normal || c.card_faces?.[0]?.image_uris?.small || ''
  if (!imageUrl) return null
  return {
    key: c.id,
    name: c.name,
    set: `${c.set_name} (${c.set?.toUpperCase()})`,
    imageUrl,
    imageUrlSmall,
    game: 'mtg' as TCGGame,
    oracleId: c.oracle_id,
    setCode: c.set,
    collectorNumber: c.collector_number,
  }
}

async function fetchWithRetry(url: string, signal: AbortSignal, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(url, { signal, headers: { 'Accept': 'application/json' } })
      if (r.status === 429 && i < retries) {
        await new Promise(res => setTimeout(res, 500 * (i + 1)))
        continue
      }
      return r
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw err
      // If TypeError (Failed to fetch / CORS issue from 429), retry
      if (i < retries) {
        await new Promise(res => setTimeout(res, 500 * (i + 1)))
        continue
      }
      throw err
    }
  }
  throw new Error('Unreachable')
}

async function resolveOne(entry: ParsedDeckEntry, signal: AbortSignal): Promise<SearchResult | null> {
  // If we have set + collector number, /cards/{set}/{num} is exact
  if (entry.setCode && entry.collectorNumber) {
    const r = await fetchWithRetry(
      `https://api.scryfall.com/cards/${encodeURIComponent(entry.setCode)}/${encodeURIComponent(entry.collectorNumber)}`,
      signal
    )
    if (r.ok) {
      const card = scryfallToResult(await r.json())
      if (card) return card
    }
  }
  
  // Clean up split cards (Scryfall exact name search works best with just the front face or the full name cleanly spaced)
  const nameToSearch = entry.name.includes('//') ? entry.name.split('//')[0].trim() : entry.name

  // Fall back to named exact — Scryfall returns the most recent printing by default
  const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(nameToSearch)}${entry.setCode ? `&set=${encodeURIComponent(entry.setCode)}` : ''}`
  const r = await fetchWithRetry(url, signal)
  
  if (!r.ok) return null
  return scryfallToResult(await r.json())
}

/**
 * Resolves parsed decklist entries to Scryfall cards.
 * Scryfall asks for ≥50–100ms between requests and a user agent — we pace 75ms.
 */
export async function resolveEntries(
  entries: ParsedDeckEntry[],
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<ResolveReport> {
  const resolved: ResolvedEntry[] = []
  const failed: ResolveReport['failed'] = []
  const ctrl = new AbortController()
  const combinedSignal = signal ?? ctrl.signal

  for (let i = 0; i < entries.length; i++) {
    if (combinedSignal.aborted) break
    const entry = entries[i]
    try {
      const card = await resolveOne(entry, combinedSignal)
      if (card) resolved.push({ entry, card })
      else failed.push({ entry, reason: 'No encontrada en Scryfall' })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') break
      failed.push({ entry, reason: err instanceof Error ? err.message : 'Error de red' })
    }
    onProgress?.(i + 1, entries.length)
    // Scryfall politeness delay (10 req/s max, we use 120ms to be safe)
    if (i < entries.length - 1) await new Promise(res => setTimeout(res, 120))
  }

  return { resolved, failed }
}
