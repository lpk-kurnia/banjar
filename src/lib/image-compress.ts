/**
 * Utility functions for image compression
 * Compresses images to max 300 KB while maintaining good quality
 */

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  maxSizeKB?: number
  initialQuality?: number
  minQuality?: number
  qualityStep?: number
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  maxSizeKB: 300,
  initialQuality: 0.9,
  minQuality: 0.1,
  qualityStep: 0.05
}

/**
 * Compress an image file to base64 string with max size
 */
export async function compressImage(
  file: File,
  options?: CompressOptions
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar')
  }

  // Check initial file size (if already small, just return as base64)
  if (file.size <= opts.maxSizeKB! * 1024) {
    return fileToBase64(file)
  }

  // Load image
  const img = await loadImage(file)

  // Calculate dimensions
  let { width, height } = calculateDimensions(
    img.width,
    img.height,
    opts.maxWidth!,
    opts.maxHeight!
  )

  // Create canvas and resize
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Gagal membuat canvas context')
  }

  // Draw image on canvas
  ctx.drawImage(img, 0, 0, width, height)

  // Try to compress with decreasing quality
  let quality = opts.initialQuality!
  let base64 = canvas.toDataURL(file.type, quality)
  let sizeKB = Math.round((base64.length * 3) / 4 / 1024)

  // Decrease quality until size is acceptable or min quality reached
  while (
    sizeKB > opts.maxSizeKB! &&
    quality > opts.minQuality!
  ) {
    quality = Math.max(quality - opts.qualityStep!, opts.minQuality!)
    base64 = canvas.toDataURL(file.type, quality)
    sizeKB = Math.round((base64.length * 3) / 4 / 1024)
  }

  // If still too large, try smaller dimensions
  if (sizeKB > opts.maxSizeKB!) {
    const scaleFactors = [0.75, 0.5, 0.33]
    for (const scale of scaleFactors) {
      width = Math.round(width * scale)
      height = Math.round(height * scale)

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      quality = opts.initialQuality!
      base64 = canvas.toDataURL(file.type, quality)
      sizeKB = Math.round((base64.length * 3) / 4 / 1024)

      // Try to compress again with decreasing quality
      while (
        sizeKB > opts.maxSizeKB! &&
        quality > opts.minQuality!
      ) {
        quality = Math.max(quality - opts.qualityStep!, opts.minQuality!)
        base64 = canvas.toDataURL(file.type, quality)
        sizeKB = Math.round((base64.length * 3) / 4 / 1024)
      }

      if (sizeKB <= opts.maxSizeKB!) {
        break
      }
    }
  }

  console.log(`Image compressed: ${Math.round(file.size / 1024)} KB → ${sizeKB} KB`)

  return base64
}

/**
 * Compress an image from base64 string
 */
export async function compressImageFromBase64(
  base64: string,
  options?: CompressOptions
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Convert base64 to file
  const file = base64ToFile(base64, 'image.jpg')

  // Check size
  const sizeKB = Math.round((base64.length * 3) / 4 / 1024)
  if (sizeKB <= opts.maxSizeKB!) {
    return base64
  }

  // Compress
  return compressImage(file, options)
}

/**
 * Load image from File
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gagal memuat gambar'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Calculate dimensions maintaining aspect ratio
 */
function calculateDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let newWidth = width
  let newHeight = height

  // Calculate aspect ratio
  const aspectRatio = width / height

  // Resize if width exceeds max
  if (newWidth > maxWidth) {
    newWidth = maxWidth
    newHeight = newWidth / aspectRatio
  }

  // Resize if height exceeds max
  if (newHeight > maxHeight) {
    newHeight = maxHeight
    newWidth = newHeight * aspectRatio
  }

  return { width: Math.round(newWidth), height: Math.round(newHeight) }
}

/**
 * Convert file to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Convert base64 to File object
 */
function base64ToFile(base64: string, filename: string = 'image.jpg'): File {
  const parts = base64.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(parts[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

/**
 * Get image dimensions from base64
 */
export function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = () => reject(new Error('Gagal memuat gambar'))
    img.src = base64
  })
}

/**
 * Get file size in KB from base64
 */
export function getBase64Size(base64: string): number {
  return Math.round((base64.length * 3) / 4 / 1024)
}

/**
 * Validate image file
 */
export function validateImageFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File harus berupa gambar' }
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Ukuran file maksimal ${maxSizeMB} MB` }
  }

  return { valid: true }
}
