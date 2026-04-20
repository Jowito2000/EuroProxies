export const PRICE_TIERS = [
  { min: 1, max: 9, price: 1.2 },
  { min: 10, max: 49, price: 1.0 },
  { min: 50, max: 199, price: 0.85 },
  { min: 200, max: Infinity, price: 0.70 },
]

export const FOIL_SURCHARGE = 0.30

export function getPricePerCard(quantity: number): number {
  const tier = PRICE_TIERS.find(t => quantity >= t.min && quantity <= t.max)
  return tier?.price ?? 0.70
}

export function calculatePrice(quantity: number, foilCount = 0): number {
  const basePrice = getPricePerCard(quantity) * quantity
  const foilExtra = foilCount * FOIL_SURCHARGE
  return Math.round((basePrice + foilExtra) * 100) / 100
}

export function getTierLabel(quantity: number): string {
  if (quantity < 10) return '1–9 cartas'
  if (quantity < 50) return '10–49 cartas'
  if (quantity < 200) return '50–199 cartas'
  return '200+ cartas'
}
