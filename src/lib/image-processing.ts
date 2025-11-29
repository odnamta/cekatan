/**
 * Image Processing Utilities for AI Vision MVP
 * 
 * V6.2: Handles client-side image resizing and compression
 */

const MAX_WIDTH = 1024
const MAX_FILE_SIZE_FOR_BASE64 = 500 * 1024 // 500KB

export interface ProcessedImage {
  /** Base64 data URL if small enough, otherwise null */
  base64: string | null
  /** Original file for upload if too large for base64 */
  file: File | null
  /** Width after resize */
  width: number
  /** Height after resize */
  height: number
  /** File size after processing */
  size: number
}

/**
 * Process an image file: resize and compress for AI vision.
 * Returns base64 if small enough, otherwise returns the file for upload.
 */
export async function processImageForVision(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width)
          width = MAX_WIDTH
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }

            // If small enough, use base64
            if (blob.size <= MAX_FILE_SIZE_FOR_BASE64) {
              const base64Reader = new FileReader()
              base64Reader.onload = () => {
                resolve({
                  base64: base64Reader.result as string,
                  file: null,
                  width,
                  height,
                  size: blob.size,
                })
              }
              base64Reader.onerror = () => reject(new Error('Failed to read blob'))
              base64Reader.readAsDataURL(blob)
            } else {
              // Too large, return file for upload
              const processedFile = new File([blob], file.name, { type: 'image/jpeg' })
              resolve({
                base64: null,
                file: processedFile,
                width,
                height,
                size: blob.size,
              })
            }
          },
          'image/jpeg',
          0.85 // Quality
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Validate that a file is an acceptable image type.
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Get image dimensions from a file.
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
