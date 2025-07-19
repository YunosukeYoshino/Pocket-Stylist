import type { NextFunction, Request, Response } from 'express'

interface RequestMetrics {
  method: string
  path: string
  userAgent?: string
  ip: string
  userId?: string
  auth0Id?: string
  timestamp: Date
  responseTime?: number
  statusCode?: number
  contentLength?: number
  error?: string
}

interface ApiMetrics {
  totalRequests: number
  requestsByMethod: Map<string, number>
  requestsByPath: Map<string, number>
  requestsByStatus: Map<number, number>
  averageResponseTime: number
  totalResponseTime: number
  errorCount: number
  activeUsers: Set<string>
  peakConcurrentRequests: number
  currentConcurrentRequests: number
}

class MonitoringService {
  private static instance: MonitoringService
  private metrics: ApiMetrics
  private recentRequests: RequestMetrics[] = []
  private readonly maxRecentRequests = 1000

  private constructor() {
    this.metrics = {
      totalRequests: 0,
      requestsByMethod: new Map(),
      requestsByPath: new Map(),
      requestsByStatus: new Map(),
      averageResponseTime: 0,
      totalResponseTime: 0,
      errorCount: 0,
      activeUsers: new Set(),
      peakConcurrentRequests: 0,
      currentConcurrentRequests: 0,
    }
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  recordRequest(requestData: RequestMetrics): void {
    this.metrics.totalRequests++
    this.metrics.currentConcurrentRequests++

    // Update peak concurrent requests
    if (this.metrics.currentConcurrentRequests > this.metrics.peakConcurrentRequests) {
      this.metrics.peakConcurrentRequests = this.metrics.currentConcurrentRequests
    }

    // Track by method
    const methodCount = this.metrics.requestsByMethod.get(requestData.method) || 0
    this.metrics.requestsByMethod.set(requestData.method, methodCount + 1)

    // Track by path (normalize dynamic paths)
    const normalizedPath = this.normalizePath(requestData.path)
    const pathCount = this.metrics.requestsByPath.get(normalizedPath) || 0
    this.metrics.requestsByPath.set(normalizedPath, pathCount + 1)

    // Track active users
    if (requestData.auth0Id) {
      this.metrics.activeUsers.add(requestData.auth0Id)
    }

    // Store recent request for detailed logging
    this.recentRequests.push(requestData)
    if (this.recentRequests.length > this.maxRecentRequests) {
      this.recentRequests.shift()
    }
  }

  recordResponse(
    requestData: RequestMetrics,
    responseTime: number,
    statusCode: number,
    contentLength?: number
  ): void {
    this.metrics.currentConcurrentRequests--

    // Update response time metrics
    this.metrics.totalResponseTime += responseTime
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.totalRequests

    // Track by status code
    const statusCount = this.metrics.requestsByStatus.get(statusCode) || 0
    this.metrics.requestsByStatus.set(statusCode, statusCount + 1)

    // Track errors (4xx and 5xx)
    if (statusCode >= 400) {
      this.metrics.errorCount++
    }

    // Update the request data
    requestData.responseTime = responseTime
    requestData.statusCode = statusCode
    requestData.contentLength = contentLength

    // Log request details based on environment and log level
    this.logRequest(requestData)
  }

  recordError(requestData: RequestMetrics, error: Error): void {
    this.metrics.currentConcurrentRequests--
    this.metrics.errorCount++
    requestData.error = error.message

    // Log error
    console.error(`[ERROR] ${requestData.method} ${requestData.path}`, {
      error: error.message,
      stack: error.stack,
      userId: requestData.userId,
      auth0Id: requestData.auth0Id,
      timestamp: requestData.timestamp.toISOString(),
      ip: requestData.ip,
      userAgent: requestData.userAgent,
    })
  }

  private logRequest(requestData: RequestMetrics): void {
    const logLevel = process.env.LOG_LEVEL || 'info'
    const isProduction = process.env.NODE_ENV === 'production'

    // In production, only log errors and important operations
    if (isProduction && requestData.statusCode && requestData.statusCode < 400) {
      return
    }

    // Determine log level based on status code
    const isError = requestData.statusCode && requestData.statusCode >= 400
    const logMethod = isError ? console.error : console.info
    const logPrefix = isError ? '[ERROR]' : '[INFO]'

    // Create log entry
    const logEntry = {
      method: requestData.method,
      path: requestData.path,
      statusCode: requestData.statusCode,
      responseTime: requestData.responseTime,
      contentLength: requestData.contentLength,
      timestamp: requestData.timestamp.toISOString(),
      ...(requestData.auth0Id && { auth0Id: requestData.auth0Id }),
      ...(requestData.userId && { userId: requestData.userId }),
      ...(requestData.error && { error: requestData.error }),
      ...(logLevel === 'debug' && {
        ip: requestData.ip,
        userAgent: requestData.userAgent,
      }),
    }

    logMethod(
      `${logPrefix} ${requestData.method} ${requestData.path} - ${requestData.statusCode} (${requestData.responseTime}ms)`,
      logEntry
    )
  }

  private normalizePath(path: string): string {
    // Replace UUIDs and numeric IDs with placeholders for grouping
    return path
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/\d+/g, '/:id')
      .replace(/\/auth0\|[a-zA-Z0-9]+/g, '/:auth0Id')
  }

  getMetrics(): ApiMetrics & { recentRequestsCount: number } {
    return {
      ...this.metrics,
      recentRequestsCount: this.recentRequests.length,
    }
  }

  getRecentRequests(limit = 100): RequestMetrics[] {
    return this.recentRequests.slice(-limit)
  }

  // Health check method
  getHealthStatus(): { status: string; uptime: number; metrics: Record<string, unknown> } {
    const uptime = process.uptime()
    const memoryUsage = process.memoryUsage()

    return {
      status: 'healthy',
      uptime,
      metrics: {
        ...this.getMetrics(),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
        performance: {
          averageResponseTimeMs: Math.round(this.metrics.averageResponseTime),
          errorRate:
            this.metrics.totalRequests > 0
              ? Math.round((this.metrics.errorCount / this.metrics.totalRequests) * 100 * 100) / 100
              : 0,
        },
      },
    }
  }

  // Reset metrics (useful for testing or periodic resets)
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      requestsByMethod: new Map(),
      requestsByPath: new Map(),
      requestsByStatus: new Map(),
      averageResponseTime: 0,
      totalResponseTime: 0,
      errorCount: 0,
      activeUsers: new Set(),
      peakConcurrentRequests: 0,
      currentConcurrentRequests: 0,
    }
    this.recentRequests = []
  }
}

export const monitoringService = MonitoringService.getInstance()

// Middleware function for request/response monitoring
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now()
  const requestData: RequestMetrics = {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userId: req.user?.sub,
    auth0Id: req.user?.sub,
    timestamp: new Date(),
  }

  // Record the incoming request
  monitoringService.recordRequest(requestData)

  // Capture original res.end to intercept response
  const originalEnd = res.end
  ;(res.end as any) = function (this: Response, ...args: any[]): Response {
    const responseTime = Date.now() - startTime
    const contentLength = res.get('Content-Length')
      ? Number.parseInt(res.get('Content-Length') || '0')
      : undefined

    monitoringService.recordResponse(requestData, responseTime, res.statusCode, contentLength)

    // Call original end method with all arguments
    return (originalEnd as any).apply(this, args)
  }

  // Handle errors
  res.on('error', error => {
    monitoringService.recordError(requestData, error)
  })

  next()
}

// Middleware for health check endpoint
export const healthCheckMiddleware = (req: Request, res: Response): void => {
  const healthStatus = monitoringService.getHealthStatus()
  res.json(healthStatus)
}

// Middleware for metrics endpoint (should be secured in production)
export const metricsMiddleware = (req: Request, res: Response): void => {
  const metrics = monitoringService.getMetrics()
  const recentRequests = monitoringService.getRecentRequests(50)

  res.json({
    metrics,
    recentRequests,
    timestamp: new Date().toISOString(),
  })
}
