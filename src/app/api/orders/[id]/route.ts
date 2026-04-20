import { NextRequest } from 'next/server'
import { getOrder, updateOrderStatus } from '@/lib/orderStore'
import { OrderStatus } from '@/types/order'

const VALID_STATUSES: OrderStatus[] = ['pending', 'paid', 'printing', 'shipped', 'delivered']

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = getOrder(id)
  if (!order) return Response.json({ error: 'Pedido no encontrado' }, { status: 404 })
  return Response.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status }: { status: OrderStatus } = await req.json()

  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const updated = updateOrderStatus(id, status)
  if (!updated) return Response.json({ error: 'Pedido no encontrado' }, { status: 404 })

  return Response.json(updated)
}
