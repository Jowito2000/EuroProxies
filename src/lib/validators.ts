import { ALLOWED_FORMATS, MAX_FILE_SIZE_BYTES, MIN_RESOLUTION_PX, CARD_ASPECT_RATIO, CARD_ASPECT_RATIO_TOLERANCE } from '@/utils/constants'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  width?: number
  height?: number
}

export function validateImageFile(file: File): Promise<ValidationResult> {
  return new Promise(resolve => {
    const errors: string[] = []

    if (!ALLOWED_FORMATS.includes(file.type)) {
      errors.push(`Formato no soportado. Usa JPG, PNG o WEBP.`)
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`El archivo supera 10 MB.`)
    }

    if (errors.length > 0) {
      return resolve({ valid: false, errors })
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const { naturalWidth: w, naturalHeight: h } = img

      if (w < MIN_RESOLUTION_PX || h < MIN_RESOLUTION_PX) {
        errors.push(`Resolución muy baja (${w}×${h}px). Mínimo recomendado: ${MIN_RESOLUTION_PX}px por lado.`)
      }

      const ratio = w / h
      const deviation = Math.abs(ratio - CARD_ASPECT_RATIO) / CARD_ASPECT_RATIO
      if (deviation > CARD_ASPECT_RATIO_TOLERANCE) {
        const orientation = ratio > 1 ? 'apaisada' : 'demasiado cuadrada o alta'
        errors.push(
          `La imagen no tiene proporciones de carta TCG (${w}×${h}px, ratio ${ratio.toFixed(2)}). ` +
          `Se esperaba ~0.72 (63×88mm). La imagen parece ${orientation}.`
        )
      }

      resolve({ valid: errors.length === 0, errors, width: w, height: h })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ valid: false, errors: ['No se pudo leer la imagen.'] })
    }

    img.src = url
  })
}
