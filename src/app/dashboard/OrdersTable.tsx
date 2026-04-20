'use client'

import { useState } from 'react'
import { Order, OrderStatus } from '@/types/order'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   'Pendiente',
  paid:      'Pagado',
  printing:  'Imprimiendo',
  shipped:   'Enviado',
  delivered: 'Entregado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   'rgba(148,163,184,0.15)',
  paid:      'rgba(16,185,129,0.15)',
  printing:  'rgba(124,58,237,0.15)',
  shipped:   'rgba(245,158,11,0.15)',
  delivered: 'rgba(16,185,129,0.25)',
}

const STATUS_TEXT: Record<OrderStatus, string> = {
  pending:   '#94a3b8',
  paid:      '#10b981',
  printing:  '#7c3aed',
  shipped:   '#f59e0b',
  delivered: '#10b981',
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  paid:     'printing',
  printing: 'shipped',
  shipped:  'delivered',
}

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [updating, setUpdating] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = orders.filter(o =>
    o.id.includes(search) ||
    o.shippingAddress.name.toLowerCase().includes(search.toLowerCase()) ||
    o.shippingAddress.country.toLowerCase().includes(search.toLowerCase())
  )

  const advance = async (order: Order) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return

    setUpdating(order.id)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) {
        const updated: Order = await res.json()
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
      }
    } finally {
      setUpdating(null)
    }
  }

  const downloadPDF = async (order: Order) => {
    if (!order.cards.length) return
    const cards = order.cards
      .filter(c => c.imageUrl)
      .map(c => ({ imageUrl: c.imageUrl, quantity: c.quantity }))

    if (!cards.length) {
      alert('Este pedido demo no tiene imágenes reales.')
      return
    }

    const res = await fetch('/api/orders/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards }),
    })
    if (!res.ok) { alert('Error generando PDF'); return }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proxyforge-${order.id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Pedidos ({filtered.length})</h2>
        <input
          type="text"
          placeholder="Buscar por ID, nombre o país..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-sm px-4 py-2 rounded-lg w-64"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--color-surface-2)' }}>
            <tr>
              {['ID', 'Cliente', 'País', 'Cartas', 'Total', 'Estado', 'Fecha', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order, i) => (
              <tr
                key={order.id}
                style={{
                  backgroundColor: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {order.id.slice(0, 16)}…
                </td>
                <td className="px-4 py-3">{order.shippingAddress.name}</td>
                <td className="px-4 py-3">{order.shippingAddress.country}</td>
                <td className="px-4 py-3 text-center">{order.totalCards}</td>
                <td className="px-4 py-3 font-semibold">{order.totalPrice.toFixed(2)} €</td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: STATUS_COLORS[order.status],
                      color: STATUS_TEXT[order.status],
                    }}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(order.createdAt).toLocaleDateString('es-ES')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => advance(order)}
                        disabled={updating === order.id}
                        className="text-xs px-3 py-1 rounded-lg font-medium disabled:opacity-50"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                        title={`Marcar como ${STATUS_LABELS[NEXT_STATUS[order.status]!]}`}
                      >
                        {updating === order.id ? '...' : `→ ${STATUS_LABELS[NEXT_STATUS[order.status]!]}`}
                      </button>
                    )}
                    <button
                      onClick={() => downloadPDF(order)}
                      className="text-xs px-3 py-1 rounded-lg font-medium"
                      style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                      title="Descargar PDF"
                    >
                      PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
            No se encontraron pedidos
          </div>
        )}
      </div>
    </div>
  )
}
