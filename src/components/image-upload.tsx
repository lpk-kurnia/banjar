'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react'
import { compressImage, validateImageFile, getBase64Size } from '@/lib/image-compress'

interface ImageUploadProps {
  value?: string | null
  onChange: (base64: string | null) => void
  maxSizeMB?: number
  maxCompressedKB?: number
  disabled?: boolean
  className?: string
  showCamera?: boolean
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
  const [isCompressing, setIsCompressing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [compressedSize, setCompressedSize] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)

    // Validate file
    const validation = validateImageFile(file, maxSizeMB)
    if (!validation.valid) {
      setError(validation.error || 'File tidak valid')
      return
    }

    setIsCompressing(true)

    try {
      // Compress image
      const compressedBase64 = await compressImage(file, {
        maxSizeKB: maxCompressedKB
      })

      // Calculate size
      const sizeKB = getBase64Size(compressedBase64)
      setCompressedSize(sizeKB)

      // Update preview and value
      setPreviewUrl(compressedBase64)
      onChange(compressedBase64)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengompresi gambar')
    } finally {
      setIsCompressing(false)
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
              {compressedSize !== null && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {compressedSize} KB
                </div>
              )}
            </div>
            {isCompressing && (
              <div className="mt-2 text-center text-white text-sm">
                Mengompresi gambar...
              </div>
            )}
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
                  {isCompressing ? 'Mengompresi gambar...' : 'Upload Gambar'}
                </p>
                <p className="text-xs text-white">
                  Max {maxSizeMB} MB (dikompresi ke max {maxCompressedKB} KB)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUploadClick}
                  disabled={disabled || isCompressing}
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
                    disabled={disabled || isCompressing}
                    className="bg-blue-800 hover:bg-blue-600 text-white border-blue-800"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Kamera
                  </Button>
                )}
              </div>
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
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isCompressing}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isCompressing}
      />
    </div>
  )
}
