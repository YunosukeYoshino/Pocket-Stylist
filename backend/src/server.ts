import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { validateEnv } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { ClaudeService } from './services/ClaudeService'
import { RecommendationService } from './services/RecommendationService'
import { RedisService } from './services/RedisService'
import { createLogger } from './utils/logger'

import aiRoutes from './routes/ai'
// Import routes
import authRoutes from './routes/auth'
import garmentRoutes from './routes/garment'
import userRoutes from './routes/user'

// Load environment variables
dotenv.config()

const app = express()
const logger = createLogger()
const prisma = new PrismaClient()

// Validate environment variables
validateEnv()

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
    credentials: true,
  })
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Claude API specific rate limiting
const claudeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 Claude API requests per minute
  message: 'Too many AI requests, please try again later.',
})
app.use('/api/v1/ai/', claudeLimiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging
app.use(requestLogger)

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/garments', garmentRoutes)
app.use('/api/v1/ai', aiRoutes)

// Error handling middleware (must be last)
app.use(errorHandler)

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

const PORT = process.env['PORT'] || 3001

// Initialize services
async function initializeServices() {
  try {
    // Initialize Redis
    await RedisService.getInstance().connect()
    logger.info('Redis connected successfully')

    // Initialize Claude service
    ClaudeService.getInstance()
    logger.info('Claude service initialized')

    // Initialize Recommendation service
    RecommendationService.getInstance()
    logger.info('Recommendation service initialized')

    // Test database connection
    await prisma.$connect()
    logger.info('Database connected successfully')

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
      logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`)
    })
  } catch (error) {
    logger.error('Failed to initialize services:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...')

  try {
    await prisma.$disconnect()
    await RedisService.getInstance().disconnect()
    logger.info('Services disconnected successfully')
    process.exit(0)
  } catch (error) {
    logger.error('Error during shutdown:', error)
    process.exit(1)
  }
})

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...')

  try {
    await prisma.$disconnect()
    await RedisService.getInstance().disconnect()
    logger.info('Services disconnected successfully')
    process.exit(0)
  } catch (error) {
    logger.error('Error during shutdown:', error)
    process.exit(1)
  }
})

// Initialize and start server
initializeServices().catch(error => {
  logger.error('Failed to start server:', error)
  process.exit(1)
})

export default app
