'use client'

import { useState, useCallback, useRef } from 'react'
import { ImageIcon, X, Loader2 } from 'lucide-react'
import { processImageForVision, isValidImageType, type ProcessedImage } from '@/lib/image-processing'

interface ImageDropZoneProps {
  onImageProcessed: (image: ProcessedImage | null) => void
  disabled?: boolean
}

/**
 * ImageDropZone - Drag/drop and paste zone for AI vision images
 * 
 * V6.2: AI Vision MVP - single image per request
 */
export function ImageDropZone({ onImageProcessed, disabled = false }: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    
    if (!isValidImageType(file)) {
      setError('Gunakan gambar JPEG, PNG, GIF, atau WebP')
      return
    }

    setIsProcessing(true)
    try {
      const processed = await processImageForVision(file)
      
      // Create preview URL
      if (processed.base64) {
        setPreview(processed.base64)
      } else if (processed.file) {
        setPreview(URL.createObjectURL(processed.file))
      }
      
      onImageProcessed(processed)
    } catch (err) {
      console.error('Image processing error:', err)
      setError('Gagal memproses gambar')
      onImageProcessed(null)
    } finally {
      setIsProcessing(false)
    }
  }, [onImageProcessed])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return
    
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [disabled, handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (disabled) return
    
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          e.preventDefault()
          handleFile(file)
          break
        }
      }
    }
  }, [disabled, handleFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [handleFile])

  const handleClear = useCallback(() => {
    setPreview(null)
    setError(null)
    onImageProcessed(null)
  }, [onImageProcessed])

  if (preview) {
    return (
      <div className="relative inline-block">
        <img
          src={preview}
          alt="Gambar yang dipilih"
          className="max-h-24 rounded-lg border border-slate-200 dark:border-slate-700"
        />
        <button
          type="button"
          onClick={handleClear}
          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          aria-label="Hapus gambar"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors
        ${isDragging 
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          <span className="text-xs text-slate-500">Memproses...</span>
        </>
      ) : (
        <>
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500">
            {error || 'Seret gambar atau klik untuk menambahkan'}
          </span>
        </>
      )}
    </div>
  )
}
