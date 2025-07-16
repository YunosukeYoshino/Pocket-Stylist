export interface User {
  sub: string
  email: string
  name?: string
  picture?: string
}

export interface FileUploadRequest {
  file: File
  category: 'avatar' | 'garment' | 'tryon' | 'other'
}

export interface FileResponse {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  category: string
  cdnUrl: string
  thumbnailUrl?: string
  variants?: Record<string, string>
  processed: boolean
  createdAt: string
}

export interface FileListResponse {
  files: FileResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ErrorResponse {
  error: string
  details?: Record<string, unknown>
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface FileListParams extends PaginationParams {
  category?: 'avatar' | 'garment' | 'tryon' | 'other'
}

export interface ImageProcessingResult {
  imageId: string
  variants: Record<string, string>
  thumbnailUrl: string
}

export interface FileMetadata {
  variants?: Record<string, string>
  checksum?: string
  processed?: boolean
  imageId?: string
  [key: string]: unknown
}