import { PDFDocument, PageSizes, rgb, PDFPage, PDFImage, StandardFonts, PDFFont } from 'pdf-lib'

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

export async function generatePrintPDF(cards: CardForPDF[], orderDetails?: any): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle('EuroProxy – Cartas para imprimir')
  doc.setCreator('EuroProxy')

  if (orderDetails) {
    const font = await doc.embedFont(StandardFonts.Helvetica)
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
    const coverPage = doc.addPage(PageSizes.A4)

    // Colores corporativos
    const primaryColor = rgb(0.486, 0.227, 0.929) // #7c3aed (Purple)
    const bgColor = rgb(0.96, 0.96, 0.98) // Light gray for cards
    const textDark = rgb(0.15, 0.15, 0.15)
    const textLight = rgb(0.4, 0.4, 0.4)
    const white = rgb(1, 1, 1)

    // Header Background
    coverPage.drawRectangle({ x: 0, y: PAGE_H - 140, width: PAGE_W, height: 140, color: primaryColor })
    
    // Título Principal con Logo
    try {
      // In web worker or browser, fetch resolves to origin
      const logoRes = await fetch('/faviconWhite.png')
      const logoBuffer = await logoRes.arrayBuffer()
      const logoImage = await doc.embedPng(logoBuffer)
      
      // Draw logo
      coverPage.drawImage(logoImage, {
        x: 50,
        y: PAGE_H - 110,
        width: 80,
        height: 80,
      })
      
      // Offset text to the right
      coverPage.drawText('EUROPROXY', { font: fontBold, size: 36, x: 150, y: PAGE_H - 75, color: white })
      coverPage.drawText('DOCUMENTO DE IMPRESIÓN Y RESUMEN', { font: fontBold, size: 12, x: 150, y: PAGE_H - 95, color: rgb(0.8, 0.7, 1) })
    } catch (e) {
      // Fallback if logo fails
      coverPage.drawText('EUROPROXY', { font: fontBold, size: 36, x: 50, y: PAGE_H - 70, color: white })
      coverPage.drawText('DOCUMENTO DE IMPRESIÓN Y RESUMEN', { font: fontBold, size: 12, x: 50, y: PAGE_H - 95, color: rgb(0.8, 0.7, 1) })
    }
    
    // Fecha / ID pedido simulado (opcional)
    const today = new Date().toLocaleDateString('es-ES')
    coverPage.drawText(`Fecha: ${today}`, { font, size: 10, x: PAGE_W - 150, y: PAGE_H - 95, color: white })

    // ---- SECCIÓN: DATOS DEL COMPRADOR ----
    const box1Y = PAGE_H - 300
    coverPage.drawRectangle({ x: 50, y: box1Y, width: PAGE_W - 100, height: 120, color: bgColor, borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 1 })
    
    coverPage.drawText('DATOS DE ENVÍO', { font: fontBold, size: 14, x: 70, y: box1Y + 90, color: primaryColor })
    
    coverPage.drawText(`Destinatario:`, { font: fontBold, size: 11, x: 70, y: box1Y + 60, color: textDark })
    coverPage.drawText(orderDetails.shippingDetails.fullName, { font, size: 11, x: 150, y: box1Y + 60, color: textLight })
    
    coverPage.drawText(`Teléfono:`, { font: fontBold, size: 11, x: 70, y: box1Y + 40, color: textDark })
    coverPage.drawText(`${orderDetails.shippingDetails.phonePrefix} ${orderDetails.shippingDetails.phone}`, { font, size: 11, x: 150, y: box1Y + 40, color: textLight })
    
    let addressLine = `${orderDetails.shippingDetails.address}, N. ${orderDetails.shippingDetails.number}`
    if (orderDetails.shippingDetails.floor) addressLine += `, Piso ${orderDetails.shippingDetails.floor}`
    if (orderDetails.shippingDetails.door) addressLine += `, Puerta ${orderDetails.shippingDetails.door}`
    
    coverPage.drawText(`Dirección:`, { font: fontBold, size: 11, x: 70, y: box1Y + 20, color: textDark })
    coverPage.drawText(addressLine, { font, size: 11, x: 150, y: box1Y + 20, color: textLight })
    coverPage.drawText(`${orderDetails.shippingDetails.city}, ${orderDetails.shippingDetails.province}`, { font, size: 11, x: 150, y: box1Y + 5, color: textLight })

    // ---- SECCIÓN: RESUMEN DE PEDIDO ----
    const box2Y = box1Y - 220
    coverPage.drawRectangle({ x: 50, y: box2Y, width: PAGE_W - 100, height: 180, color: white, borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 1 })
    
    coverPage.drawText('DESGLOSE DEL PEDIDO', { font: fontBold, size: 14, x: 70, y: box2Y + 140, color: primaryColor })
    
    // Header tabla
    coverPage.drawLine({ start: { x: 70, y: box2Y + 125 }, end: { x: PAGE_W - 70, y: box2Y + 125 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) })
    
    coverPage.drawText(`Cartas procesadas para impresión (${orderDetails.totalCards} unidades)`, { font, size: 12, x: 70, y: box2Y + 100, color: textDark })
    coverPage.drawText(`${orderDetails.subtotal.toFixed(2)} €`, { font: fontBold, size: 12, x: PAGE_W - 120, y: box2Y + 100, color: textDark })

    coverPage.drawText(`Gastos de envío y manipulación`, { font, size: 12, x: 70, y: box2Y + 70, color: textDark })
    coverPage.drawText(`${orderDetails.shippingCost.toFixed(2)} €`, { font: fontBold, size: 12, x: PAGE_W - 120, y: box2Y + 70, color: textDark })

    // Total Line
    coverPage.drawLine({ start: { x: 70, y: box2Y + 50 }, end: { x: PAGE_W - 70, y: box2Y + 50 }, thickness: 2, color: primaryColor })
    
    coverPage.drawText(`TOTAL`, { font: fontBold, size: 16, x: 70, y: box2Y + 20, color: textDark })
    coverPage.drawText(`${orderDetails.total.toFixed(2)} €`, { font: fontBold, size: 18, x: PAGE_W - 130, y: box2Y + 20, color: primaryColor })

    // Footer Info
    coverPage.drawText('NOTA: Este documento no tiene validez fiscal. Las hojas siguientes contienen las cartas listas', { font, size: 10, x: 50, y: 70, color: textLight })
    coverPage.drawText('para impresión con sus correspondientes marcas de corte. Por favor, imprime al 100% de escala.', { font, size: 10, x: 50, y: 55, color: textLight })
  }

  // Expandir cartas según quantity (Embebiendo la imagen una sola vez por carta única)
  const expanded: PDFImage[] = []
  for (const card of cards) {
    let pdfImage
    if (card.mimeType === 'image/png') {
      pdfImage = await doc.embedPng(card.imageBytes)
    } else {
      // jpeg y webp se embeben como jpeg
      pdfImage = await doc.embedJpg(card.imageBytes)
    }

    for (let i = 0; i < card.quantity; i++) {
      expanded.push(pdfImage)
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

      const pdfImage = slice[i]

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
