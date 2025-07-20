import { z } from 'zod'

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const fileUploadSchema = z.object({
  file: z.any(),
  category: z.enum(['avatar', 'garment', 'tryon', 'other']),
})

export interface FileValidationResult {
  isValid: boolean
  error?: string
  fileInfo?: {
    size: number
    mimeType: string
    filename: string
  }
}

export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    }
  }
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
  const fileExtension = file.name.toLowerCase().split('.').pop()
  
  if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
    return {
      isValid: false,
      error: `File extension .${fileExtension} is not allowed`
    }
  }
  
  return {
    isValid: true,
    fileInfo: {
      size: file.size,
      mimeType: file.type,
      filename: file.name
    }
  }
}

export function validateFileContent(fileBuffer: ArrayBuffer): FileValidationResult {
  // Basic file signature validation
  const bytes = new Uint8Array(fileBuffer)
  
  // Check for common image file signatures
  const signatures = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    webp: [0x52, 0x49, 0x46, 0x46], // RIFF header
    avif: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66] // ftyp avif
  }
  
  let isValidSignature = false
  
  // Check JPEG signature
  if (bytes.length >= 3 && 
      bytes[0] === signatures.jpeg[0] && 
      bytes[1] === signatures.jpeg[1] && 
      bytes[2] === signatures.jpeg[2]) {
    isValidSignature = true
  }
  
  // Check PNG signature
  if (bytes.length >= 8 && 
      signatures.png.every((byte, index) => bytes[index] === byte)) {
    isValidSignature = true
  }
  
  // Check WebP signature
  if (bytes.length >= 12 && 
      signatures.webp.every((byte, index) => bytes[index] === byte) &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    isValidSignature = true
  }
  
  // Check AVIF signature
  if (bytes.length >= 12 && 
      signatures.avif.every((byte, index) => bytes[index] === byte)) {
    isValidSignature = true
  }
  
  if (!isValidSignature) {
    return {
      isValid: false,
      error: 'File content does not match expected image format'
    }
  }
  
  return { isValid: true }
}

export function generateSecureFilename(originalFilename: string, userId: string): string {
  // Sanitize userId to prevent directory traversal
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-_]/g, '')
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 15)
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'unknown'
  
  return `${sanitizedUserId}/${timestamp}_${randomSuffix}.${extension}`
}