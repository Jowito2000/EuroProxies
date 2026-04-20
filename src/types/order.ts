import { Card } from './card'

export type OrderStatus = 'pending' | 'paid' | 'printing' | 'shipped' | 'delivered'

export interface ShippingAddress {
  name: string
  street: string
  city: string
  postalCode: string
  country: string
}

export interface Order {
  id: string
  userId?: string
  cards: Card[]
  totalCards: number
  subtotal: number
  shippingCost: number
  totalPrice: number
  shippingAddress: ShippingAddress
  status: OrderStatus
  stripeSessionId?: string
  createdAt: string
  updatedAt: string
}
