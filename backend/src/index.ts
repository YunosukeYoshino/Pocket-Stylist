import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authMiddleware } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { fileRoutes } from './routes/files'

export interface Env {
  // Database
  DATABASE_URL: string
  
  // Cloudflare R2
  R2_BUCKET: R2Bucket
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_ENDPOINT: string
  R2_BUCKET_NAME: string
  
  // Cloudflare Images
  CLOUDFLARE_IMAGES_ACCOUNT_ID: string
  CLOUDFLARE_IMAGES_API_TOKEN: string
  
  // Auth0
  AUTH0_DOMAIN: string
  AUTH0_AUDIENCE: string
  
  // CDN
  CDN_BASE_URL: string
}

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('*', cors())
app.use('*', logger())
app.use('*', errorHandler)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Protected routes
app.use('/v1/*', authMiddleware)

// API routes
app.route('/v1/files', fileRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

export default app