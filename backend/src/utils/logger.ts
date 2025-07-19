import winston from 'winston'
import { env } from '../config/env'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
}

winston.addColors(colors)

// Create logger instance
export const createLogger = () => {
  const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  )

  const devFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      if (stack) {
        return `${timestamp} [${level}]: ${message}\n${stack}`
      }
      return `${timestamp} [${level}]: ${message}`
    })
  )

  const logger = winston.createLogger({
    level: env.LOG_LEVEL,
    levels,
    format: env.NODE_ENV === 'development' ? devFormat : format,
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ],
  })

  return logger
}

// Create default logger instance
export const logger = createLogger()

// Log Claude API usage
export const logClaudeUsage = (
  userId: string,
  operation: string,
  tokensUsed: number,
  cost: number,
  duration: number
) => {
  logger.info('Claude API Usage', {
    userId,
    operation,
    tokensUsed,
    cost,
    duration,
    timestamp: new Date().toISOString(),
  })
}

// Log recommendation generation
export const logRecommendationGeneration = (
  userId: string,
  recommendationType: string,
  itemCount: number,
  processingTime: number,
  success: boolean
) => {
  logger.info('Recommendation Generation', {
    userId,
    recommendationType,
    itemCount,
    processingTime,
    success,
    timestamp: new Date().toISOString(),
  })
}

// Log user feedback
export const logUserFeedback = (
  userId: string,
  recommendationId: string,
  feedbackType: string,
  rating: number
) => {
  logger.info('User Feedback', {
    userId,
    recommendationId,
    feedbackType,
    rating,
    timestamp: new Date().toISOString(),
  })
}
