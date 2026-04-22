'use client'

import { useState } from 'react'
import { CardForPDF } from './pdfGenerator'
import { useCartStore } from './cartStore'
import { Card } from '@/types/card'

async function compressImage(file: File): Promise<{ buffer: Uint8Array, mimeType: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      const MAX_WIDTH = 744  // ~300 DPI para 63mm (calidad óptima para impresión sin pesar demasiado)
      const MAX_HEIGHT = 1039 // ~300 DPI para 88mm
      
      let width = img.width
      let height = img.height
      
      // Solo comprimimos si es más grande de lo necesario o si es un PNG pesado
      if (width > MAX_WIDTH || height > MAX_HEIGHT || file.type === 'image/png' || file.size > 500000) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
        // No la agrandamos, solo la achicamos si hace falta
        if (ratio < 1) {
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
           file.arrayBuffer().then(buf => resolve({ buffer: new Uint8Array(buf), mimeType: file.type })).catch(reject)
           return
        }
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        
        // Exportar siempre como JPEG para ahorrar mucho espacio, calidad 0.82 es un buen balance
        canvas.toBlob((blob) => {
          if (!blob) {
             file.arrayBuffer().then(buf => resolve({ buffer: new Uint8Array(buf), mimeType: file.type })).catch(reject)
             return
          }
          blob.arrayBuffer().then(buf => resolve({ buffer: new Uint8Array(buf), mimeType: 'image/jpeg' })).catch(reject)
        }, 'image/jpeg', 0.82)
      } else {
        // Ya es pequeña y ligera
        file.arrayBuffer().then(buf => resolve({ buffer: new Uint8Array(buf), mimeType: file.type })).catch(reject)
      }
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      file.arrayBuffer().then(buf => resolve({ buffer: new Uint8Array(buf), mimeType: file.type })).catch(reject)
    }
    
    img.src = url
  })
}

export function useClientPDF() {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const generate = async (cards: Card[], files: Map<string, File>, skipDownload = false, compress = false, orderDetails?: any): Promise<Uint8Array | undefined> => {
    setGenerating(true)
    setError('')
    useCartStore.getState().setIsGeneratingPDF(true)

    // Yield control to the browser so React can render the spinner and
    // CSS animations can start on the compositor thread before heavy work begins.
    await new Promise(resolve => setTimeout(resolve, 150))

    try {
      const cardData: CardForPDF[] = await Promise.all(
        cards.map(async card => {
          const file = files.get(card.id)
          if (!file) throw new Error(`Archivo no encontrado para carta ${card.id}`)

          if (compress) {
            const compressed = await compressImage(file)
            return { imageBytes: compressed.buffer, mimeType: compressed.mimeType as any, quantity: card.quantity }
          } else {
            const arrayBuffer = await file.arrayBuffer()
            const mimeType = file.type as CardForPDF['mimeType']
            return { imageBytes: new Uint8Array(arrayBuffer), mimeType, quantity: card.quantity }
          }
        })
      )

      const pdfBytes = await new Promise<Uint8Array>((resolve, reject) => {
        const worker = new Worker(new URL('./pdfWorker.ts', import.meta.url))
        
        worker.onmessage = (e) => {
          if (e.data.success) {
            resolve(e.data.pdfBytes)
          } else {
            reject(new Error(e.data.error))
          }
          worker.terminate()
        }
        
        worker.onerror = (err) => {
          reject(new Error('Fallo crítico en el hilo secundario (Web Worker).'))
          worker.terminate()
        }
        
        // Pass the cardData and orderDetails.
        worker.postMessage({ cards: cardData, orderDetails })
      })

      if (!skipDownload) {
        // Descargar en el navegador
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'proxyforge-print.pdf'
        a.click()
        URL.revokeObjectURL(url)
      }

      return pdfBytes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar PDF')
      return undefined
    } finally {
      setGenerating(false)
      useCartStore.getState().setIsGeneratingPDF(false)
    }
  }

  return { generate, generating, error }
}
