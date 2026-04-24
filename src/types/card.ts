export type TCGGame = 'mtg' | 'pokemon' | 'yugioh' | 'lorcana' | 'onepiece' | 'custom'

export type CardFinish = 'normal' | 'foil'

export interface Card {
  id: string
  imageUrl: string
  name?: string
  game: TCGGame
  quantity: number
  finish: CardFinish
  dpiValid: boolean
  fileSize?: number
  width?: number
  height?: number
  cardBackId?: string
}
