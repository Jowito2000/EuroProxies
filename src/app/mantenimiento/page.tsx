'use client'

import Link from 'next/link'

export default function MantenimientoPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center" style={{ position: 'relative' }}>
        {/* Background watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] select-none flex items-center justify-center -z-10">
          <img src="/favicon.png" alt="" className="w-full max-w-xs object-contain" />
        </div>

        {/* Icon */}
        <div
          className="mx-auto mb-8 flex items-center justify-center"
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(167,139,250,0.1))',
            border: '1px solid rgba(124,58,237,0.35)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/mantenimiento.png" alt="Mantenimiento" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
        </div>

        {/* Tag + Title */}
        <div className="section-tag mb-4">
          Pasarela de pago
        </div>
        <h1 className="section-title mb-4">Estamos en mantenimiento</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
          El sistema de pago está siendo configurado y estará disponible muy pronto.<br />
          Gracias por tu paciencia.
        </p>

        {/* Status card */}
        <div
          className="surface-card p-5 mb-8 text-left space-y-3"
          style={{ borderColor: 'rgba(124,58,237,0.2)' }}
        >
          <div className="flex items-center gap-3 text-sm">
            <span style={{ color: '#10b981', fontSize: '1rem' }}>✓</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Editor de cartas</span>
            <span className="ml-auto text-xs font-semibold" style={{ color: '#10b981' }}>Activo</span>
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ borderTop: '1px solid rgba(124,58,237,0.08)', paddingTop: '12px' }}>
            <span style={{ color: '#10b981', fontSize: '1rem' }}>✓</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Carrito y configuración</span>
            <span className="ml-auto text-xs font-semibold" style={{ color: '#10b981' }}>Activo</span>
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ borderTop: '1px solid rgba(124,58,237,0.08)', paddingTop: '12px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1rem' }}>⏳</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Pasarela de pago</span>
            <span className="ml-auto text-xs font-semibold" style={{ color: '#f59e0b' }}>Próximamente</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/cart" className="btn-primary px-8 py-3 text-sm font-bold inline-block">
            ← Volver al carrito
          </Link>
          <Link
            href="/"
            className="px-8 py-3 text-sm font-semibold inline-block rounded-xl transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-text-muted)',
            }}
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
