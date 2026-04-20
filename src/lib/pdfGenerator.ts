import { PDFDocument, PageSizes, rgb, PDFPage } from 'pdf-lib'

// Dimensiones en puntos (1mm = 2.834645669pt)
const MM = 2.834645669

const CARD_W = 63 * MM   // 178.6pt
const CARD_H = 88 * MM   // 249.4pt
const BLEED  = 3  * MM   // 8.5pt  (sangrado por lado)
const SLOT_W = CARD_W + BLEED * 2
const SLOT_H = CARD_H + BLEED * 2

const COLS = 3
const ROWS = 3
const PER_PAGE = COLS * ROWS

const PAGE_W = PageSizes.A4[0]  // 595.28pt
const PAGE_H = PageSizes.A4[1]  // 841.89pt

// Margen para centrar la cuadrícula en la página
const MARGIN_X = (PAGE_W - COLS * SLOT_W) / 2
const MARGIN_Y = (PAGE_H - ROWS * SLOT_H) / 2

// Longitud de las marcas de corte
const MARK_LEN = 5 * MM
const MARK_OFFSET = 2 * MM  // separación del borde de la carta

export interface CardForPDF {
  imageBytes: Uint8Array
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  quantity: number
}

export async function generatePrintPDF(cards: CardForPDF[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle('EuroProxy – Cartas para imprimir')
  doc.setCreator('EuroProxy')

  // Expandir cartas según quantity
  const expanded: Omit<CardForPDF, 'quantity'>[] = []
  for (const card of cards) {
    for (let i = 0; i < card.quantity; i++) {
      expanded.push({ imageBytes: card.imageBytes, mimeType: card.mimeType })
    }
  }

  const totalPages = Math.ceil(expanded.length / PER_PAGE)

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const page = doc.addPage(PageSizes.A4)
    const slice = expanded.slice(pageIdx * PER_PAGE, (pageIdx + 1) * PER_PAGE)

    for (let i = 0; i < slice.length; i++) {
      const col = i % COLS
      const row = Math.floor(i / COLS)

      // pdf-lib: y=0 está abajo, invertimos filas
      const x = MARGIN_X + col * SLOT_W
      const y = PAGE_H - MARGIN_Y - (row + 1) * SLOT_H

      const { imageBytes, mimeType } = slice[i]

      let pdfImage
      if (mimeType === 'image/png') {
        pdfImage = await doc.embedPng(imageBytes)
      } else {
        // jpeg y webp se embeben como jpeg
        pdfImage = await doc.embedJpg(imageBytes)
      }

      // Dibujar imagen dentro del slot (con sangrado)
      page.drawImage(pdfImage, {
        x: x,
        y: y,
        width: SLOT_W,
        height: SLOT_H,
      })

      // Marcas de corte en las 4 esquinas de la carta (sin sangrado)
      drawCutMarks(page, x + BLEED, y + BLEED, CARD_W, CARD_H)
    }
  }

  return doc.save()
}

function drawCutMarks(page: PDFPage, x: number, y: number, w: number, h: number) {
  const color = rgb(0, 0, 0)
  const thickness = 0.5

  const corners = [
    { cx: x,     cy: y,     dx: -1, dy: -1 },  // inferior-izquierda
    { cx: x + w, cy: y,     dx:  1, dy: -1 },  // inferior-derecha
    { cx: x,     cy: y + h, dx: -1, dy:  1 },  // superior-izquierda
    { cx: x + w, cy: y + h, dx:  1, dy:  1 },  // superior-derecha
  ]

  for (const { cx, cy, dx, dy } of corners) {
    // Línea horizontal
    page.drawLine({
      start: { x: cx + dx * MARK_OFFSET, y: cy },
      end:   { x: cx + dx * (MARK_OFFSET + MARK_LEN), y: cy },
      thickness,
      color,
    })
    // Línea vertical
    page.drawLine({
      start: { x: cx, y: cy + dy * MARK_OFFSET },
      end:   { x: cx, y: cy + dy * (MARK_OFFSET + MARK_LEN) },
      thickness,
      color,
    })
  }
}
