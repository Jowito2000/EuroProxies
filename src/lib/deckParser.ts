export interface ParsedDeckEntry {
  name: string
  quantity: number
  setCode?: string
  collectorNumber?: string
  section?: string
}

const SECTION_HEADERS = /^(sideboard|commander|companion|maybeboard|mainboard|deck|tokens?|side|main)\s*[:]?$/i

const LINE = /^\s*(\d+)\s*x?\s+(.+?)(?:\s*\(([A-Za-z0-9]{2,6})\)\s*([A-Za-z0-9-]+)?)?\s*$/

export function parseDecklist(input: string): ParsedDeckEntry[] {
  if (!input.trim()) return []

  const entries: ParsedDeckEntry[] = []
  let currentSection: string | undefined

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    if (line.startsWith('#') || line.startsWith('//')) continue

    const asSection = line.replace(/[:#/\\*]+$/g, '').trim()
    if (SECTION_HEADERS.test(asSection)) {
      currentSection = asSection.toLowerCase()
      continue
    }

    // Strip out tags from Archidekt [Category], Moxfield *F*, trailing text
    let cleanLine = line.replace(/\s*\[[^\]]*\]/g, '') // remove [Anything]
    cleanLine = cleanLine.replace(/\s*\*[^*]*\*/g, '') // remove *Anything*
    cleanLine = cleanLine.replace(/\s*#.*$/g, '') // remove # comments
    cleanLine = cleanLine.replace(/\s+(Foil|Etched|Nonfoil)\s*$/i, '') // remove trailing foil tags
    cleanLine = cleanLine.trim()

    const match = LINE.exec(cleanLine)
    if (!match) continue

    const [, qtyStr, rawName, set, num] = match
    const quantity = parseInt(qtyStr, 10)
    if (!quantity || quantity < 1 || quantity > 999) continue

    const name = rawName.replace(/\s+/g, ' ').trim()
    if (!name) continue

    entries.push({
      name,
      quantity,
      setCode: set ? set.toLowerCase() : undefined,
      collectorNumber: num,
      section: currentSection,
    })
  }

  return entries
}
