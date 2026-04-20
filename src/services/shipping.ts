export type ShippingZone = 'spain' | 'eu' | 'international'

export const SHIPPING_RATES: Record<ShippingZone, number> = {
  spain: 3.0,
  eu: 6.0,
  international: 10.0,
}

const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'SE',
]

export function getShippingZone(countryCode: string): ShippingZone {
  if (countryCode === 'ES') return 'spain'
  if (EU_COUNTRIES.includes(countryCode.toUpperCase())) return 'eu'
  return 'international'
}

export function calculateShipping(countryCode: string): number {
  return SHIPPING_RATES[getShippingZone(countryCode)]
}
