'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, Camera, Loader2 } from 'lucide-react'
import { compressImage, validateImageFile, getBase64Size } from '@/lib/image-compress'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  maxSizeMB?: number
  maxCompressedKB?: number
  disabled?: boolean
  className?: string
  showCamera?: boolean
}

/**
 * Convert base64 data URL to File object
 */
function base64ToFile(base64: string, filename: string): File {
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

export function ImageUpload({
  value,
  onChange,
  maxSizeMB = 10,
  maxCompressedKB = 300,
  disabled = false,
  className = '',
  showCamera = true
}: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [compressedSize, setCompressedSize] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)

    // Validate file type
    const validation = validateImageFile(file, maxSizeMB)
    if (!validation.valid) {
      setError(validation.error || 'File tidak valid')
      return
    }

    setIsProcessing(true)

    // Create local preview immediately
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    try {
      // Step 1: Compress image client-side
      const compressedBase64 = await compressImage(file, {
        maxSizeKB: maxCompressedKB
      })
      const sizeKB = getBase64Size(compressedBase64)
      setCompressedSize(sizeKB)

      // Step 2: Convert compressed base64 to File
      const ext = file.name.split('.').pop() || 'jpg'
      const compressedFile = base64ToFile(compressedBase64, `compressed-${Date.now()}.${ext}`)

      // Step 3: Upload compressed file to Supabase Storage
      const formData = new FormData()
      formData.append('file', compressedFile)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal mengupload gambar')
        setPreviewUrl(value || null)
        setCompressedSize(null)
        return
      }

      // Step 4: Update with public URL from Storage
      setPreviewUrl(data.data.url)
      onChange(data.data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat upload')
      setPreviewUrl(value || null)
      setCompressedSize(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input
    e.target.value = ''
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setCompressedSize(null)
    setError(null)
    onChange(null)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  return (
    <div className={className}>
      {previewUrl ? (
        <Card className="border-blue-800 bg-blue-950/30">
          <CardContent className="p-3">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-80 object-contain rounded-lg"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-1" />
                    <p className="text-sm">Mengompresi & mengupload...</p>
                  </div>
                </div>
              )}
              {compressedSize !== null && !isProcessing && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {compressedSize} KB
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-blue-800 bg-blue-950/30">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-4 bg-blue-900/50 rounded-full">
                <ImageIcon className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-white">
                  {isProcessing ? 'Mengompresi & mengupload...' : 'Upload Gambar'}
                </p>
                <p className="text-xs text-white">
                  Max {maxSizeMB} MB (dikompresi ke max {maxCompressedKB} KB)
                </p>
              </div>
              {isProcessing ? (
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadClick}
                    disabled={disabled}
                    className="bg-blue-800 hover:bg-blue-600 text-white border-blue-800"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Pilih File
                  </Button>
                  {showCamera && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCameraClick}
                      disabled={disabled}
                      className="bg-blue-800 hover:bg-blue-600 text-white border-blue-800"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Kamera
                    </Button>
                  )}
                </div>
              )}
              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />
    </div>
  )
}
