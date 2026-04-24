'use client'

import { TCGGame } from '@/types/card'

export interface SearchResult {
  /** Unique key for React lists */
  key: string
  name: string
  set: string
  imageUrl: string
  imageUrlSmall: string
  game: TCGGame
  /** MTG only: groups all prints of the same card. Same oracleId = same card, different art/set */
  oracleId?: string
  /** MTG only: 3-letter set code, e.g. "cmr" */
  setCode?: string
  /** MTG only: collector number within the set */
  collectorNumber?: string
}

export interface CardGroup {
  /** Stable id for the group (oracleId for MTG, key for others) */
  groupId: string
  /** The print shown on the grid tile (first/most recent) */
  display: SearchResult
  /** All prints of this card (length === 1 for non-MTG) */
  prints: SearchResult[]
}

export function groupResults(results: SearchResult[], game: TCGGame): CardGroup[] {
  const map = new Map<string, CardGroup>()
  for (const r of results) {
    // Para MTG usamos oracleId si existe, para el resto agrupamos por el nombre exacto de la carta
    const id = (game === 'mtg' && r.oracleId) ? r.oracleId : r.name.toLowerCase()
    const existing = map.get(id)
    if (existing) existing.prints.push(r)
    else map.set(id, { groupId: id, display: r, prints: [r] })
  }
  return Array.from(map.values())
}

// ─── Debounced search helper ──────────────────────────────────────

const DEBOUNCE_MS = 350
let abortController: AbortController | null = null

export async function searchCards(
  query: string,
  game: TCGGame
): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  // Abort previous in-flight request
  if (abortController) abortController.abort()
  abortController = new AbortController()
  const signal = abortController.signal

  try {
    switch (game) {
      case 'mtg':
        return await searchMTG(query, signal)
      case 'pokemon':
        return await searchPokemon(query, signal)
      case 'yugioh':
        return await searchYuGiOh(query, signal)
      case 'lorcana':
        return await searchLorcana(query, signal)
      case 'onepiece':
        return await searchOnePiece(query, signal)
      default:
        return []
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') return []
    console.error(`Card search error (${game}):`, err)
    return []
  }
}

// ─── MTG — Scryfall ───────────────────────────────────────────────
// unique=prints so each art/set gets its own result
async function searchMTG(q: string, signal: AbortSignal): Promise<SearchResult[]> {
  const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(q)}&unique=prints&order=released&dir=desc&page=1`
  const res = await fetch(url, {
    signal,
    headers: { 'Accept': 'application/json' },
  })
  if (!res.ok) return []
  const json = await res.json()
  if (!json.data) return []

  return json.data.slice(0, 175).map((c: any) => ({
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
}

// ─── Pokémon TCG ──────────────────────────────────────────────────
async function searchPokemon(q: string, signal: AbortSignal): Promise<SearchResult[]> {
  const terms = q.trim().split(/\s+/).map(t => `name:*${t}*`).join(' ')
  const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(terms)}&pageSize=30&orderBy=-set.releaseDate`
  const res = await fetch(url, { signal })
  if (!res.ok) return []
  const json = await res.json()
  if (!json.data) return []

  return json.data.map((c: any) => ({
    key: c.id,
    name: c.name,
    set: c.set?.name ?? '',
    imageUrl: c.images?.large || c.images?.small || '',
    imageUrlSmall: c.images?.small || '',
    game: 'pokemon' as TCGGame,
  })).filter((r: SearchResult) => r.imageUrl)
}

// ─── Yu-Gi-Oh! — YGOPRODeck ──────────────────────────────────────
async function searchYuGiOh(q: string, signal: AbortSignal): Promise<SearchResult[]> {
  const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(q)}&num=15&offset=0`
  const res = await fetch(url, { signal })
  if (!res.ok) return []
  const json = await res.json()
  if (!json.data) return []

  // YGO returns card_images[] array per card (different arts)
  const results: SearchResult[] = []
  for (const card of json.data) {
    for (const img of card.card_images ?? []) {
      results.push({
        key: `ygo-${img.id}`,
        name: card.name,
        set: card.card_sets?.[0]?.set_name ?? card.type ?? '',
        imageUrl: img.image_url,
        imageUrlSmall: img.image_url_small,
        game: 'yugioh',
      })
    }
  }
  return results.slice(0, 30)
}

// ─── Lorcana — lorcana-api.com ────────────────────────────────────
async function searchLorcana(q: string, signal: AbortSignal): Promise<SearchResult[]> {
  const url = `https://api.lorcana-api.com/cards/fetch?search=Name~${encodeURIComponent(q)}`
  const res = await fetch(url, { signal })
  if (!res.ok) return []
  const json = await res.json()

  // API returns a plain array, not { results: [...] }
  const cards = Array.isArray(json) ? json : json.results ?? []
  if (!cards.length) return []

  return cards.slice(0, 30).map((c: any) => ({
    key: `lor-${c.Unique_ID || c.Name}-${c.Set_Num || ''}`,
    name: c.Name,
    set: c.Set_Name ?? '',
    imageUrl: c.Image ?? '',
    imageUrlSmall: c.Image ?? '',
    game: 'lorcana' as TCGGame,
  })).filter((r: SearchResult) => r.imageUrl)
}

// ─── One Piece — no free public API available ─────────────────────
async function searchOnePiece(_q: string, _signal: AbortSignal): Promise<SearchResult[]> {
  // No reliable free API exists for One Piece TCG at this time
  return []
}

