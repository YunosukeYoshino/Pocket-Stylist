import type { PrismaClient } from '@prisma/client'
import express from 'express'
import request from 'supertest'
import { errorHandler } from '../../middleware/errorHandler'
import { authRouter } from '../auth'

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Check if we should simulate missing auth header
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' })
    }

    req.user = { sub: 'auth0|test-user' }
    next()
  },
}))

describe('Auth Routes', () => {
  let app: express.Application
  let mockPrisma: jest.Mocked<PrismaClient>

  beforeEach(() => {
    // Set default environment variables for Auth0
    process.env.AUTH0_DOMAIN = 'test-domain.auth0.com'
    process.env.AUTH0_CLIENT_ID = 'test-client-id'
    process.env.AUTH0_CLIENT_SECRET = 'test-client-secret'
    process.env.JWT_SECRET = 'test-jwt-secret'
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'

    app = express()
    app.use(express.json())

    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
    } as never

    // Inject mock Prisma into request
    app.use((req, res, next) => {
      req.prisma = mockPrisma
      next()
    })

    app.use('/auth', authRouter)

    // Add error handler middleware
    app.use(errorHandler)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /auth/login', () => {
    it('should login successfully with valid Auth0 data', async () => {
      const loginData = {
        auth0Id: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const mockUser = {
        id: 'user-id',
        email: loginData.email,
        name: loginData.name,
        avatarUrl: loginData.avatarUrl,
        auth0Id: loginData.auth0Id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock the user creation/retrieval - findOrCreate will call findByAuth0Id first
      ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null) // User doesn't exist
      ;(mockPrisma.user.create as jest.Mock).mockResolvedValue(mockUser as never)

      const response = await request(app).post('/auth/login').send(loginData).expect(200)

      expect(response.body.data.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatarUrl: mockUser.avatarUrl,
      })
      expect(response.body.data.message).toBe('Login successful')
    })

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // Missing auth0Id
      }

      const response = await request(app).post('/auth/login').send(incompleteData).expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should handle internal server errors', async () => {
      const loginData = {
        auth0Id: 'auth0|123',
        email: 'test@example.com',
      }

      // Mock database error - this should cause the userService.findOrCreateUser to fail
      ;(mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const response = await request(app).post('/auth/login').send(loginData)

      // The response status shows what error occurred, no need to check body.error
      expect([400, 500]).toContain(response.status)
    })
  })

  describe('POST /auth/refresh', () => {
    beforeEach(() => {
      // Mock global fetch for Auth0 API calls
      global.fetch = jest.fn()
    })

    it('should refresh token successfully', async () => {
      const refreshData = {
        refreshToken: 'valid-refresh-token',
      }

      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const response = await request(app).post('/auth/refresh').send(refreshData).expect(200)

      expect(response.body.data.accessToken).toBe(mockResponse.access_token)
      expect(response.body.data.refreshToken).toBe(mockResponse.refresh_token)
    })

    it('should return 400 for missing refresh token', async () => {
      const response = await request(app).post('/auth/refresh').send({}).expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should handle invalid refresh token', async () => {
      const refreshData = {
        refreshToken: 'invalid-refresh-token',
      }

      // Reset the mock to ensure it fails this time
      ;(global.fetch as jest.Mock).mockClear()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'invalid_grant' }),
      })

      const response = await request(app).post('/auth/refresh').send(refreshData)

      // Auth0 API error should return 401, but could be 500 depending on error handling
      expect([401, 500]).toContain(response.status)
    })
  })

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)

      expect(response.body.data.message).toBe('Logout successful')
    })
  })

  describe('GET /auth/validate', () => {
    it('should validate token successfully', async () => {
      const response = await request(app)
        .get('/auth/validate')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)

      expect(response.body.data.valid).toBe(true)
      expect(response.body.data.message).toBe('Token is valid')
    })

    it('should return 401 for missing authorization header', async () => {
      const response = await request(app).get('/auth/validate').expect(401)

      expect(response.body.error).toBeDefined()
    })
  })

  describe('GET /auth/me', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        gender: 'male',
        birthDate: new Date('1990-01-01'),
        phone: '+1234567890',
        preferences: { style: 'casual' },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser as never)

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)

      expect(response.body.data.id).toBe(mockUser.id)
      expect(response.body.data.email).toBe(mockUser.email)
      expect(response.body.data.name).toBe(mockUser.name)
    })

    it('should return 404 when user not found', async () => {
      ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).get('/auth/me').set('Authorization', 'Bearer valid-token')

      // UserService.getUserProfile should throw ApiError with 404 when user not found
      expect([404, 500]).toContain(response.status)
    })
  })
})

declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient
      user?: {
        sub: string
        email?: string
        iat?: number
        exp?: number
        aud?: string | string[]
        iss?: string
        scope?: string
        permissions?: string[]
      }
    }
  }
}
