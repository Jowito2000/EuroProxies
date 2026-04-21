import { ALLOWED_FORMATS, MAX_FILE_SIZE_BYTES, MIN_RESOLUTION_PX } from '@/utils/constants'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  width?: number
  height?: number
}

export function validateImageFile(file: File): Promise<ValidationResult> {
  return new Promise(resolve => {
    const errors: string[] = []
    const warnings: string[] = []

    if (!ALLOWED_FORMATS.includes(file.type)) {
      errors.push(`Formato no soportado. Usa JPG, PNG o WEBP.`)
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`El archivo supera 10 MB.`)
    }

    if (errors.length > 0) {
      return resolve({ valid: false, errors, warnings })
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const { naturalWidth: w, naturalHeight: h } = img

      if (w < MIN_RESOLUTION_PX || h < MIN_RESOLUTION_PX) {
        warnings.push(`Resolución baja (${w}×${h}px). Recomendado ≥${MIN_RESOLUTION_PX}px por lado (~300 DPI) para mejor calidad de impresión.`)
      }

      resolve({ valid: true, errors, warnings, width: w, height: h })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ valid: false, errors: ['No se pudo leer la imagen.'], warnings })
    }

    img.src = url
  })
}
