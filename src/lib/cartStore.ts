'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Card, TCGGame } from '@/types/card'
import { getDefaultCardBackForGame } from '@/lib/cardBacks'
import { calculatePrice, getPricePerCard } from './pricing'
import { calculateShipping } from '@/services/shipping'
import { createClient } from '@/lib/supabase/browser'
import { idbDelete, idbDeleteMany } from './imageDB'

export interface ShippingDetails {
  fullName: string
  phonePrefix: string
  phone: string
  address: string
  number: string
  floor: string
  door: string
  city: string
  province: string
}

interface CartState {
  cards: Card[]
  defaultCardBacks: Record<string, string>
  shippingCountry: string
  shippingDetails: ShippingDetails
  customCardBacks: Record<string, string>
  addCard: (card: Card) => void
  removeCard: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateImageUrl: (id: string, url: string) => void
  updateCardBack: (id: string, cardBackId: string) => void
  updateAllCardBacks: (game: TCGGame | 'all', cardBackId: string) => void
  setDefaultCardBack: (game: TCGGame, cardBackId: string) => void
  setCustomCardBackImage: (cardBackId: string, imageUrl: string) => void
  clearCart: () => void
  setShippingCountry: (country: string) => void
  updateShippingDetails: (details: Partial<ShippingDetails>) => void
  totalCards: () => number
  subtotal: () => number
  shippingCost: () => number
  total: () => number
  loadFromSupabase: (userId: string) => Promise<void>
  saveToSupabase: (userId: string, cards: Card[]) => Promise<void>
  isGeneratingPDF: boolean
  setIsGeneratingPDF: (val: boolean) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cards: [],
      defaultCardBacks: {},
      customCardBacks: {},
      shippingCountry: 'ES',
      shippingDetails: { fullName: '', phonePrefix: '+34', phone: '', address: '', number: '', floor: '', door: '', city: '', province: '' },
      isGeneratingPDF: false,
      setIsGeneratingPDF: (val) => set({ isGeneratingPDF: val }),

      addCard: (card) => set(state => {
        if (state.cards.some(c => c.id === card.id)) return state
        
        // Asignar el dorso por defecto si no lo tiene
        const defaultBack = state.defaultCardBacks[card.game] || getDefaultCardBackForGame(card.game)
        const newCard = { ...card, cardBackId: card.cardBackId || defaultBack }
        
        return { cards: [...state.cards, newCard] }
      }),

      removeCard: (id) => {
        idbDelete(id).catch(console.error)
        set(state => ({ cards: state.cards.filter(c => c.id !== id) }))
      },

      updateQuantity: (id, quantity) => set(state => ({
        cards: state.cards.map(c => c.id === id ? { ...c, quantity } : c),
      })),

      updateImageUrl: (id, url) => set(state => ({
        cards: state.cards.map(c => c.id === id ? { ...c, imageUrl: url } : c),
      })),

      updateCardBack: (id, cardBackId) => set(state => ({
        cards: state.cards.map(c => c.id === id ? { ...c, cardBackId } : c),
      })),

      updateAllCardBacks: (game, cardBackId) => set(state => ({
        cards: state.cards.map(c => {
          if (game === 'all' || c.game === game) return { ...c, cardBackId }
          return c
        })
      })),

      setDefaultCardBack: (game, cardBackId) => set(state => ({
        defaultCardBacks: { ...state.defaultCardBacks, [game]: cardBackId }
      })),
      
      setCustomCardBackImage: (cardBackId, imageUrl) => set(state => ({
        customCardBacks: { ...state.customCardBacks, [cardBackId]: imageUrl }
      })),

      clearCart: () => {
        idbDeleteMany(get().cards.map(c => c.id)).catch(console.error)
        set({ cards: [] })
      },

      setShippingCountry: (country) => set({ shippingCountry: country }),
      
      updateShippingDetails: (details) => set(state => ({
        shippingDetails: { ...state.shippingDetails, ...details }
      })),

      totalCards: () => get().cards.reduce((sum, c) => sum + c.quantity, 0),

      subtotal: () => {
        const total = get().totalCards()
        const foilCount = get().cards
          .filter(c => c.finish === 'foil')
          .reduce((sum, c) => sum + c.quantity, 0)
        return calculatePrice(total, foilCount)
      },

      shippingCost: () => calculateShipping(get().shippingCountry),

      total: () => {
        const s = get()
        return Math.round((s.subtotal() + s.shippingCost()) * 100) / 100
      },

      loadFromSupabase: async (userId) => {
        const supabase = createClient()
        const { data } = await supabase
          .from('cart_items')
          .select('card_data, quantity')
          .eq('user_id', userId)

        if (!data?.length) return

        const cards: Card[] = data.map(row => ({ ...row.card_data, quantity: row.quantity }))
        set({ cards })
      },

      saveToSupabase: async (userId, cards) => {
        const supabase = createClient()
        await supabase.from('cart_items').delete().eq('user_id', userId)

        if (!cards.length) return

        await supabase.from('cart_items').insert(
          cards.map(card => ({
            user_id: userId,
            card_data: card,
            quantity: card.quantity,
          }))
        )
      },
    }),
    { 
      name: 'proxyforge-cart',
      partialize: (state) => ({ 
        cards: state.cards,
        defaultCardBacks: state.defaultCardBacks,
        shippingCountry: state.shippingCountry,
        shippingDetails: state.shippingDetails
      }),
    }
  )
)
