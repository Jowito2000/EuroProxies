import { generatePrintPDF } from './pdfGenerator'

self.onmessage = async (e: MessageEvent) => {
  try {
    const pdfBytes = await generatePrintPDF(e.data.cards, e.data.orderDetails)
    // Transfer the ArrayBuffer back to the main thread for better performance
    self.postMessage({ success: true, pdfBytes }, { transfer: [pdfBytes.buffer] })
  } catch (err: any) {
    self.postMessage({ success: false, error: err.message || 'Error en el worker de PDF' })
  }
}
