'use client'

import { useState } from 'react'
import { generatePrintPDF, CardForPDF } from './pdfGenerator'
import { Card } from '@/types/card'

export function useClientPDF() {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const generate = async (cards: Card[], files: Map<string, File>) => {
    setGenerating(true)
    setError('')

    try {
      const cardData: CardForPDF[] = await Promise.all(
        cards.map(async card => {
          const file = files.get(card.id)
          if (!file) throw new Error(`Archivo no encontrado para carta ${card.id}`)

          const arrayBuffer = await file.arrayBuffer()
          const mimeType = file.type as CardForPDF['mimeType']

          return { imageBytes: new Uint8Array(arrayBuffer), mimeType, quantity: card.quantity }
        })
      )

      const pdfBytes = await generatePrintPDF(cardData)

      // Descargar en el navegador
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'proxyforge-print.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar PDF')
    } finally {
      setGenerating(false)
    }
  }

  return { generate, generating, error }
}
