'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Card } from '@/types/card'
import { calculatePrice, getPricePerCard } from './pricing'
import { calculateShipping } from '@/services/shipping'
import { createClient } from '@/lib/supabase/browser'

interface CartState {
  cards: Card[]
  shippingCountry: string
  addCard: (card: Card) => void
  removeCard: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setShippingCountry: (country: string) => void
  totalCards: () => number
  subtotal: () => number
  shippingCost: () => number
  total: () => number
  loadFromSupabase: (userId: string) => Promise<void>
  saveToSupabase: (userId: string, cards: Card[]) => Promise<void>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cards: [],
      shippingCountry: 'ES',

      addCard: (card) => set(state => {
        if (state.cards.some(c => c.id === card.id)) return state
        return { cards: [...state.cards, card] }
      }),

      removeCard: (id) => set(state => ({
        cards: state.cards.filter(c => c.id !== id),
      })),

      updateQuantity: (id, quantity) => set(state => ({
        cards: state.cards.map(c => c.id === id ? { ...c, quantity } : c),
      })),

      clearCart: () => set({ cards: [] }),

      setShippingCountry: (country) => set({ shippingCountry: country }),

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
    { name: 'proxyforge-cart' }
  )
)
