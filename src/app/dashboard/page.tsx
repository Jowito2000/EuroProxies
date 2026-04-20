import { getAllOrders, getMetrics } from '@/lib/orderStore'
import OrdersTable from './OrdersTable'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [orders, metrics] = await Promise.all([getAllOrders(), getMetrics()])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Panel de administración</h1>
        <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          EuroProxy Admin
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <MetricCard label="Pedidos totales" value={metrics.total} />
        <MetricCard label="Ingresos" value={`${metrics.revenue.toFixed(2)} €`} highlight />
        <MetricCard label="Cartas impresas" value={metrics.totalCards} />
        <MetricCard label="En preparación" value={metrics.printing} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {[
          { label: 'Pendiente', value: metrics.pending, status: 'pending' },
          { label: 'Pagado', value: metrics.total - metrics.pending - metrics.printing - metrics.shipped - metrics.delivered, status: 'paid' },
          { label: 'Imprimiendo', value: metrics.printing, status: 'printing' },
          { label: 'Enviado', value: metrics.shipped, status: 'shipped' },
          { label: 'Entregado', value: metrics.delivered, status: 'delivered' },
        ].map(s => (
          <div
            key={s.status}
            className="p-3 rounded-xl text-center text-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="text-2xl font-bold mb-1">{s.value}</div>
            <div style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <OrdersTable initialOrders={orders} />
    </div>
  )
}

function MetricCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div
      className="p-5 rounded-xl"
      style={{ backgroundColor: 'var(--color-surface)', border: `1px solid ${highlight ? 'var(--color-primary)' : 'var(--color-border)'}` }}
    >
      <div
        className="text-3xl font-extrabold mb-1"
        style={{ color: highlight ? 'var(--color-primary)' : 'var(--color-text)' }}
      >
        {value}
      </div>
      <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  )
}
