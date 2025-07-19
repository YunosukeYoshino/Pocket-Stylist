import type { Env } from '../index'

export interface ImageProcessingOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
}

export interface ImageVariant {
  name: string
  width: number
  height: number
  quality: number
}

export interface CloudflareImageInfo {
  id: string
  filename: string
  uploaded: string
  requireSignedURLs: boolean
  variants: string[]
  meta?: Record<string, unknown>
}

export const IMAGE_VARIANTS: ImageVariant[] = [
  { name: 'thumbnail', width: 150, height: 150, quality: 80 },
  { name: 'small', width: 480, height: 480, quality: 85 },
  { name: 'medium', width: 720, height: 720, quality: 90 },
  { name: 'large', width: 1080, height: 1080, quality: 95 },
]

export class ImageService {
  private accountId: string
  private apiToken: string
  private baseUrl: string
  
  constructor(env: Env) {
    this.accountId = env.CLOUDFLARE_IMAGES_ACCOUNT_ID
    this.apiToken = env.CLOUDFLARE_IMAGES_API_TOKEN
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images`
  }
  
  async uploadImage(
    imageBuffer: ArrayBuffer,
    filename: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    const formData = new FormData()
    formData.append('file', new Blob([imageBuffer]), filename)
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }
    
    const response = await fetch(`${this.baseUrl}/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to upload image: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    const result = await response.json() as { result: { id: string } }
    return result.result.id
  }
  
  async deleteImage(imageId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.statusText}`)
    }
  }
  
  getImageUrl(imageId: string, options?: ImageProcessingOptions): string {
    const baseUrl = `https://imagedelivery.net/${this.accountId}/${imageId}`
    
    if (!options) {
      return `${baseUrl}/public`
    }
    
    const params = new URLSearchParams()
    
    if (options.width) params.append('w', options.width.toString())
    if (options.height) params.append('h', options.height.toString())
    if (options.quality) params.append('q', options.quality.toString())
    if (options.format) params.append('f', options.format)
    if (options.fit) params.append('fit', options.fit)
    
    return `${baseUrl}/public?${params.toString()}`
  }
  
  getVariantUrl(imageId: string, variant: ImageVariant): string {
    return this.getImageUrl(imageId, {
      width: variant.width,
      height: variant.height,
      quality: variant.quality,
      format: 'auto',
      fit: 'scale-down',
    })
  }
  
  async processImageVariants(
    imageBuffer: ArrayBuffer,
    filename: string,
    metadata?: Record<string, string>
  ): Promise<{
    imageId: string
    variants: Record<string, string>
  }> {
    const imageId = await this.uploadImage(imageBuffer, filename, metadata)
    
    const variants: Record<string, string> = {}
    
    for (const variant of IMAGE_VARIANTS) {
      variants[variant.name] = this.getVariantUrl(imageId, variant)
    }
    
    return {
      imageId,
      variants,
    }
  }
  
  async getImageInfo(imageId: string): Promise<CloudflareImageInfo> {
    const response = await fetch(`${this.baseUrl}/v1/${imageId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get image info: ${response.statusText}`)
    }
    
    const result = await response.json() as { result: CloudflareImageInfo }
    return result.result
  }
}