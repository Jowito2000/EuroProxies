import { getAllOrders, getMetrics } from '@/lib/orderStore'

export async function GET() {
  const [orders, metrics] = await Promise.all([getAllOrders(), getMetrics()])
  return Response.json({ orders, metrics })
}
