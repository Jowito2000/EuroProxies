import type { TCGGame } from '@/types/card'

export interface CardBackOption {
  id: string
  name: string
  imageUrl: string
  game: TCGGame | 'universal'
}

export const CARD_BACKS: CardBackOption[] = [
  // Universal
  {
    id: 'univ-1',
    name: 'EuroProxy Universal',
    game: 'universal',
    imageUrl: '/images/cardbacks/UniversalCardBack.png'
  },

  // MTG
  { id: 'mtg-euro', name: 'EuroProxy MTG', game: 'mtg', imageUrl: '/images/cardbacks/MTGEuroProxyCardBack.png' },
  { id: 'mtg-1', name: 'Dorso MTG 1', game: 'mtg', imageUrl: '/images/cardbacks/MTGCardBack1.png' },
  { id: 'mtg-2', name: 'Dorso MTG 2', game: 'mtg', imageUrl: '/images/cardbacks/MTGCardBack2.png' },
  { id: 'mtg-3', name: 'Dorso MTG 3', game: 'mtg', imageUrl: '/images/cardbacks/MTGCardBack3.png' },

  // Pokemon
  { id: 'pkm-euro', name: 'EuroProxy Pokemon', game: 'pokemon', imageUrl: '/images/cardbacks/PokemonEuroProxyCardBack.png' },
  { id: 'pkm-1', name: 'Dorso Pokemon 1', game: 'pokemon', imageUrl: '/images/cardbacks/PokemonCardBack1.png' },
  { id: 'pkm-2', name: 'Dorso Pokemon 2', game: 'pokemon', imageUrl: '/images/cardbacks/PokemonCardBack2.png' },
  { id: 'pkm-3', name: 'Dorso Pokemon 3', game: 'pokemon', imageUrl: '/images/cardbacks/PokemonCardBack3.png' },

  // Yu-Gi-Oh!
  { id: 'ygo-euro', name: 'EuroProxy YGO', game: 'yugioh', imageUrl: '/images/cardbacks/YuGiOhEuroProxyCardBack.png' },
  { id: 'ygo-1', name: 'Dorso YGO 1', game: 'yugioh', imageUrl: '/images/cardbacks/YuGiOhCardBack1.png' },
  { id: 'ygo-2', name: 'Dorso YGO 2', game: 'yugioh', imageUrl: '/images/cardbacks/YuGiOhCardBack2.png' },

  // Lorcana
  { id: 'lor-euro', name: 'EuroProxy Lorcana', game: 'lorcana', imageUrl: '/images/cardbacks/LorcanaEuroProxyCardback.png' },
  { id: 'lor-1', name: 'Dorso Lorcana 1', game: 'lorcana', imageUrl: '/images/cardbacks/LorcanaCardback1.png' },
  { id: 'lor-2', name: 'Dorso Lorcana 2', game: 'lorcana', imageUrl: '/images/cardbacks/LorcanaCardback2.png' },
  { id: 'lor-3', name: 'Dorso Lorcana 3', game: 'lorcana', imageUrl: '/images/cardbacks/LorcanaCardback3.png' },

  // One Piece
  { id: 'op-euro', name: 'EuroProxy OP', game: 'onepiece', imageUrl: '/images/cardbacks/OnePieceEuroProxyCardBack.png' },
  { id: 'op-1', name: 'Dorso OP 1', game: 'onepiece', imageUrl: '/images/cardbacks/OnePieceCardBack1.png' },
  { id: 'op-2', name: 'Dorso OP 2', game: 'onepiece', imageUrl: '/images/cardbacks/OnePieceCardBack2.png' },
  { id: 'op-3', name: 'Dorso OP 3', game: 'onepiece', imageUrl: '/images/cardbacks/OnePieceCardBack3.png' },

  // Custom / Personalizados
  { id: 'custom-mtg', name: 'Dorso Personalizado', game: 'mtg', imageUrl: 'https://placehold.co/400x560/2d2d4e/ffffff?text=Dorso+MTG' },
  { id: 'custom-pokemon', name: 'Dorso Personalizado', game: 'pokemon', imageUrl: 'https://placehold.co/400x560/2d2d4e/ffffff?text=Dorso+Pokemon' },
  { id: 'custom-yugioh', name: 'Dorso Personalizado', game: 'yugioh', imageUrl: 'https://placehold.co/400x582/1e1b4b/ffffff?text=Dorso+YGO' },
  { id: 'custom-lorcana', name: 'Dorso Personalizado', game: 'lorcana', imageUrl: 'https://placehold.co/400x560/2d2d4e/ffffff?text=Dorso+Lorcana' },
  { id: 'custom-onepiece', name: 'Dorso Personalizado', game: 'onepiece', imageUrl: 'https://placehold.co/400x560/2d2d4e/ffffff?text=Dorso+OnePiece' },
]

export function getCardBacksForGame(game: TCGGame): CardBackOption[] {
  return CARD_BACKS.filter(b => b.game === game || b.game === 'universal')
}

export function getDefaultCardBackForGame(game: TCGGame): string {
  const options = getCardBacksForGame(game)
  // Devolvemos el EuroProxy específico del juego como prioridad predeterminada
  const euroProxy = options.find(o => o.id.includes('-euro'))
  if (euroProxy) return euroProxy.id
  
  const specific = options.find(o => o.game === game)
  return specific ? specific.id : 'univ-1'
}

export function getCardBackById(id: string): CardBackOption {
  return CARD_BACKS.find(b => b.id === id) || CARD_BACKS[0]
}
