'use client'

import { useCartStore } from '@/lib/cartStore'
import { useFileStore } from '@/lib/fileStore'
import { useClientPDF } from '@/lib/useClientPDF'

export default function DownloadPDFButton() {
  const cards = useCartStore(s => s.cards)
  const files = useFileStore(s => s.files)
  const { generate, generating, error } = useClientPDF()

  const hasFiles = cards.every(c => files.has(c.id))

  if (!hasFiles) return null

  return (
    <div className="space-y-2">
      <button
        onClick={() => generate(cards, files)}
        disabled={generating}
        className="w-full py-3 rounded-xl font-bold transition-opacity disabled:opacity-60"
        style={{
          backgroundColor: 'transparent',
          border: '2px solid var(--color-primary)',
          color: 'var(--color-primary)',
        }}
      >
        {generating ? 'Generando PDF...' : '⬇ Descargar PDF de impresión'}
      </button>

      {error && (
        <p className="text-xs" style={{ color: 'var(--color-danger)' }}>⚠ {error}</p>
      )}

      <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
        PDF A4 · 9 cartas por hoja · Con marcas de corte
      </p>
    </div>
  )
}
