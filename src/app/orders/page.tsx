import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserOrders } from '@/lib/orderStore'
import { Order } from '@/types/order'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  printing: 'Imprimiendo',
  shipped: 'Enviado',
  delivered: 'Entregado',
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#8892a4',
  paid: '#7c3aed',
  printing: '#f59e0b',
  shipped: '#3b82f6',
  delivered: '#10b981',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/orders')

  const orders = await getUserOrders(user.id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--color-text-muted)' }}>
          <p className="text-lg mb-4">Aún no tienes pedidos.</p>
          <Link
            href="/editor"
            className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            Crear mi primer pedido
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const color = STATUS_COLOR[order.status] ?? '#8892a4'
  const label = STATUS_LABEL[order.status] ?? order.status

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-xs font-mono mb-1" style={{ color: 'var(--color-text-muted)' }}>
            #{order.id.slice(0, 20)}…
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0" style={{ backgroundColor: `${color}22`, color }}>
          {label}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span style={{ color: 'var(--color-text-muted)' }}>
          {order.totalCards} carta{order.totalCards !== 1 ? 's' : ''} · {order.shippingAddress.city}, {order.shippingAddress.country}
        </span>
        <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
          {order.totalPrice.toFixed(2)} €
        </span>
      </div>
    </div>
  )
}
