import { createAdminClient } from '@/lib/supabase/server'
import { Order, OrderStatus } from '@/types/order'

export async function saveOrder(order: Order): Promise<void> {
  const supabase = await createAdminClient()
  await supabase.from('orders').upsert({
    id: order.id,
    user_id: order.userId ?? null,
    cards: order.cards,
    total_cards: order.totalCards,
    subtotal: order.subtotal,
    shipping_cost: order.shippingCost,
    total_price: order.totalPrice,
    shipping_address: order.shippingAddress,
    status: order.status,
    stripe_session_id: order.stripeSessionId ?? null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  })
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('orders').select('*').eq('id', id).single()
  return data ? rowToOrder(data) : undefined
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []).map(rowToOrder)
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []).map(rowToOrder)
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return data ? rowToOrder(data) : undefined
}

export async function getMetrics() {
  const orders = await getAllOrders()
  const revenue = orders
    .filter(o => o.status !== 'pending')
    .reduce((sum, o) => sum + o.totalPrice, 0)

  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    printing: orders.filter(o => o.status === 'printing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: Math.round(revenue * 100) / 100,
    totalCards: orders.reduce((sum, o) => sum + o.totalCards, 0),
  }
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    cards: row.cards as Order['cards'],
    totalCards: row.total_cards as number,
    subtotal: row.subtotal as number,
    shippingCost: row.shipping_cost as number,
    totalPrice: row.total_price as number,
    shippingAddress: row.shipping_address as Order['shippingAddress'],
    status: row.status as OrderStatus,
    stripeSessionId: row.stripe_session_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
