import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Env } from '../index'

export class R2Service {
  private s3Client: S3Client
  private bucketName: string
  private cdnBaseUrl: string
  
  constructor(env: Env) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    })
    
    this.bucketName = env.R2_BUCKET_NAME
    this.cdnBaseUrl = env.CDN_BASE_URL
  }
  
  async uploadFile(
    key: string,
    file: ArrayBuffer,
    mimeType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType,
      Metadata: metadata,
    })
    
    await this.s3Client.send(command)
    
    return this.getCdnUrl(key)
  }
  
  async getFile(key: string): Promise<ReadableStream | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
      
      const response = await this.s3Client.send(command)
      return response.Body as ReadableStream
    } catch (error) {
      console.error('Error getting file from R2:', error)
      return null
    }
  }
  
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })
    
    await this.s3Client.send(command)
  }
  
  async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })
    
    return await getSignedUrl(this.s3Client, command, { expiresIn })
  }
  
  getCdnUrl(key: string): string {
    return `${this.cdnBaseUrl}/${key}`
  }
  
  async getFileMetadata(key: string): Promise<Record<string, string> | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
      
      const response = await this.s3Client.send(command)
      return response.Metadata || null
    } catch (error) {
      console.error('Error getting file metadata:', error)
      return null
    }
  }
}