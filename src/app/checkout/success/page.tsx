import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-3xl font-bold mb-4">¡Pedido confirmado!</h1>
      <p className="text-lg mb-2" style={{ color: 'var(--color-text-muted)' }}>
        Hemos recibido tu pago. Nos ponemos a imprimir tus proxies.
      </p>
      <p className="text-sm mb-10" style={{ color: 'var(--color-text-muted)' }}>
        Recibirás un email de confirmación con el seguimiento del envío.
      </p>

      <div
        className="rounded-xl p-5 mb-8 text-sm text-left space-y-2"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex justify-between">
          <span style={{ color: 'var(--color-text-muted)' }}>Estado</span>
          <span className="font-semibold" style={{ color: 'var(--color-success)' }}>Pago recibido</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--color-text-muted)' }}>Siguiente paso</span>
          <span>En preparación</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--color-text-muted)' }}>Tiempo estimado</span>
          <span>3–7 días hábiles</span>
        </div>
      </div>

      <Link
        href="/editor"
        className="inline-block px-6 py-3 rounded-xl font-bold text-white"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        Crear otro pedido
      </Link>
    </div>
  )
}
