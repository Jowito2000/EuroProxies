import { NextRequest } from 'next/server'
import { generatePrintPDF, CardForPDF } from '@/lib/pdfGenerator'

interface PdfRequestCard {
  imageUrl: string
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    const { cards }: { cards: PdfRequestCard[] } = await request.json()

    if (!cards?.length) {
      return Response.json({ error: 'No hay cartas' }, { status: 400 })
    }

    // Descargar imágenes y convertir a bytes
    const cardData: CardForPDF[] = await Promise.all(
      cards.map(async card => {
        const res = await fetch(card.imageUrl)
        if (!res.ok) throw new Error(`No se pudo obtener imagen: ${card.imageUrl}`)

        const contentType = res.headers.get('content-type') ?? 'image/jpeg'
        const mimeType = contentType.includes('png')
          ? 'image/png'
          : contentType.includes('webp')
          ? 'image/webp'
          : 'image/jpeg'

        const arrayBuffer = await res.arrayBuffer()
        return {
          imageBytes: new Uint8Array(arrayBuffer),
          mimeType: mimeType as CardForPDF['mimeType'],
          quantity: card.quantity,
        }
      })
    )

    const pdfBytes = await generatePrintPDF(cardData)

    return new Response(pdfBytes.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="proxyforge-print.pdf"',
        'Content-Length': pdfBytes.length.toString(),
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return Response.json({ error: 'Error al generar el PDF' }, { status: 500 })
  }
}
