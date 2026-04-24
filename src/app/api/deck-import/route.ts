import { NextResponse } from 'next/server'
import { parseDecklist, ParsedDeckEntry } from '@/lib/deckParser'

export const runtime = 'nodejs'

type Source = 'archidekt' | 'mtggoldfish' | 'tappedout' | 'scryfall' | 'moxfield' | 'unknown'

interface ImportResponse {
  source: Source
  entries: ParsedDeckEntry[]
  title?: string
  moxfieldBlocked?: boolean
  error?: string
}

function detectSource(url: string): Source {
  const host = (() => {
    try { return new URL(url).hostname.toLowerCase() } catch { return '' }
  })()
  if (host.includes('archidekt.com')) return 'archidekt'
  if (host.includes('mtggoldfish.com')) return 'mtggoldfish'
  if (host.includes('tappedout.net')) return 'tappedout'
  if (host.includes('scryfall.com')) return 'scryfall'
  if (host.includes('moxfield.com')) return 'moxfield'
  return 'unknown'
}

async function importArchidekt(url: string): Promise<Pick<ImportResponse, 'entries' | 'title'>> {
  const match = url.match(/archidekt\.com\/decks\/(\d+)/i)
  if (!match) throw new Error('URL de Archidekt inválida')
  const id = match[1]
  const res = await fetch(`https://archidekt.com/api/decks/${id}/`, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'EuroProxies/1.0' },
  })
  if (!res.ok) throw new Error(`Archidekt devolvió ${res.status}`)
  const data = await res.json()

  interface ArchidektCard {
    quantity?: number
    categories?: unknown[]
    card?: {
      name?: string
      collectorNumber?: string
      oracleCard?: { name?: string }
      edition?: { editioncode?: string }
    }
  }
  const entries: ParsedDeckEntry[] = ((data.cards ?? []) as ArchidektCard[]).map(c => ({
    name: c.card?.oracleCard?.name ?? c.card?.name ?? '',
    quantity: c.quantity ?? 1,
    setCode: c.card?.edition?.editioncode?.toLowerCase(),
    collectorNumber: c.card?.collectorNumber ?? undefined,
    section: typeof c.categories?.[0] === 'string' ? (c.categories[0] as string).toLowerCase() : undefined,
  })).filter(e => e.name && e.quantity > 0)

  return { entries, title: data.name }
}

async function importMTGGoldfish(url: string): Promise<Pick<ImportResponse, 'entries' | 'title'>> {
  const match = url.match(/mtggoldfish\.com\/(?:deck|archetype)\/(\d+)/i)
  if (!match) throw new Error('URL de MTGGoldfish inválida')
  const id = match[1]
  const res = await fetch(`https://www.mtggoldfish.com/deck/download/${id}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 EuroProxies/1.0' },
  })
  if (!res.ok) throw new Error(`MTGGoldfish devolvió ${res.status}`)
  const text = await res.text()
  return { entries: parseDecklist(text) }
}

async function importTappedOut(url: string): Promise<Pick<ImportResponse, 'entries' | 'title'>> {
  const clean = url.split('?')[0].replace(/\/$/, '')
  const res = await fetch(`${clean}?fmt=txt`, {
    headers: { 'User-Agent': 'Mozilla/5.0 EuroProxies/1.0' },
  })
  if (!res.ok) throw new Error(`TappedOut devolvió ${res.status}`)
  const text = await res.text()
  return { entries: parseDecklist(text) }
}

async function importScryfall(url: string): Promise<Pick<ImportResponse, 'entries' | 'title'>> {
  const match = url.match(/scryfall\.com\/@[^/]+\/decks\/([0-9a-f-]{36})/i)
  if (!match) throw new Error('URL de Scryfall inválida')
  const id = match[1]
  const exportUrl = `https://api.scryfall.com/decks/${id}/export/text`
  const res = await fetch(exportUrl, { headers: { 'User-Agent': 'EuroProxies/1.0' } })
  if (!res.ok) throw new Error(`Scryfall devolvió ${res.status}`)
  const text = await res.text()
  return { entries: parseDecklist(text) }
}

export async function POST(request: Request) {
  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ImportResponse>({ source: 'unknown', entries: [], error: 'JSON inválido' }, { status: 400 })
  }

  const url = body.url?.trim()
  if (!url) {
    return NextResponse.json<ImportResponse>({ source: 'unknown', entries: [], error: 'Falta la URL' }, { status: 400 })
  }

  const source = detectSource(url)

  if (source === 'moxfield') {
    return NextResponse.json<ImportResponse>({
      source,
      entries: [],
      moxfieldBlocked: true,
      error: 'Moxfield no permite importación automática por su política de uso. Exporta tu mazo como texto y pégalo en la pestaña "Pegar lista".',
    }, { status: 200 })
  }

  if (source === 'unknown') {
    return NextResponse.json<ImportResponse>({
      source,
      entries: [],
      error: 'Dominio no soportado. Usa Archidekt, MTGGoldfish, TappedOut o Scryfall.',
    }, { status: 400 })
  }

  try {
    const result = source === 'archidekt' ? await importArchidekt(url)
      : source === 'mtggoldfish' ? await importMTGGoldfish(url)
      : source === 'tappedout' ? await importTappedOut(url)
      : await importScryfall(url)

    if (result.entries.length === 0) {
      return NextResponse.json<ImportResponse>({ source, entries: [], error: 'El mazo está vacío o no se pudo leer.' }, { status: 200 })
    }
    return NextResponse.json<ImportResponse>({ source, ...result })
  } catch (err) {
    console.error('Deck import error:', err)
    return NextResponse.json<ImportResponse>({
      source,
      entries: [],
      error: err instanceof Error ? err.message : 'Error al importar el mazo',
    }, { status: 200 })
  }
}
