import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { logger } from '../utils/logger'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ClaudeAPIError extends AppError {
  constructor(message: string, statusCode = 500) {
    super(`Claude API Error: ${message}`, statusCode)
  }
}

export class RecommendationError extends AppError {
  constructor(message: string, statusCode = 500) {
    super(`Recommendation Error: ${message}`, statusCode)
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500
  let message = 'Internal Server Error'

  // Log error details
  logger.error('Error caught by error handler:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  })

  // Handle different types of errors
  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message
  } else if (error instanceof ZodError) {
    statusCode = 400
    message = 'Validation Error'
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    res.status(statusCode).json({
      error: message,
      details: validationErrors,
    })
    return
  } else if (error instanceof PrismaClientKnownRequestError) {
    statusCode = 400

    switch (error.code) {
      case 'P2002':
        message = 'Unique constraint violation'
        break
      case 'P2025':
        message = 'Record not found'
        statusCode = 404
        break
      case 'P2003':
        message = 'Foreign key constraint violation'
        break
      case 'P2014':
        message = 'Invalid ID provided'
        break
      default:
        message = 'Database error'
    }
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  } else if (error.name === 'NotBeforeError') {
    statusCode = 401
    message = 'Token not active'
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(process.env['NODE_ENV'] === 'development' && {
      details: error.message,
      stack: error.stack,
    }),
  })
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404)
  next(error)
}
