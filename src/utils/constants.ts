export const CARD_DIMENSIONS = {
  width_mm: 63,
  height_mm: 88,
  bleed_mm: 3,
}

export const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const MIN_RESOLUTION_PX = 744  // ~300 DPI a 63mm

// Ratio esperado de carta TCG: 63/88 ≈ 0.716 (portrait)
export const CARD_ASPECT_RATIO = CARD_DIMENSIONS.width_mm / CARD_DIMENSIONS.height_mm
export const CARD_ASPECT_RATIO_TOLERANCE = 0.15  // ±15% de margen

export const TCG_GAMES = [
  { value: 'mtg', label: 'Magic: The Gathering' },
  { value: 'pokemon', label: 'Pokémon' },
  { value: 'yugioh', label: 'Yu-Gi-Oh!' },
  { value: 'lorcana', label: 'Lorcana' },
  { value: 'onepiece', label: 'One Piece' },
  { value: 'custom', label: 'Personalizada' },
] as const

export const SITE_NAME = 'EuroProxy'
export const SITE_TAGLINE = 'Proxies TCG de calidad, enviados a tu puerta'
