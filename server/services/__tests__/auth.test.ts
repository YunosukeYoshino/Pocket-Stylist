import type { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { ApiError } from '../../middleware/errorHandler'
import { AuthService } from '../auth'

// Mock the fetch function
global.fetch = jest.fn()

describe('AuthService', () => {
  let authService: AuthService
  let mockPrisma: jest.Mocked<PrismaClient>

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    } as never

    authService = new AuthService(mockPrisma)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('handleLogin', () => {
    it('should successfully login a user', async () => {
      const userData = {
        email: 'test@example.com',
        auth0Id: 'auth0|123',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const mockUser = {
        id: 'user-id',
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
      }

      // Mock UserService.findOrCreateUser
      jest.spyOn(authService.userService, 'findOrCreateUser').mockResolvedValue(mockUser as never)

      const result = await authService.handleLogin(userData)

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          avatarUrl: mockUser.avatarUrl,
        },
        message: 'Login successful',
      })
    })

    it('should handle login errors', async () => {
      const userData = {
        email: 'test@example.com',
        auth0Id: 'auth0|123',
      }

      // Mock UserService.findOrCreateUser to throw error
      jest
        .spyOn(authService.userService, 'findOrCreateUser')
        .mockRejectedValue(new Error('Database error'))

      await expect(authService.handleLogin(userData)).rejects.toThrow(ApiError)
    })
  })

  describe('handleLogout', () => {
    it('should successfully logout a user', async () => {
      const result = await authService.handleLogout('auth0|123')

      expect(result).toEqual({
        message: 'Logout successful',
      })
    })
  })

  describe('validateToken', () => {
    it('should successfully validate a token', async () => {
      const token = 'valid-token'
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
      }

      jest.spyOn(jwt, 'decode').mockReturnValue({
        sub: 'auth0|123',
        email: 'test@example.com',
      } as never)

      jest.spyOn(authService.userService, 'getUserProfile').mockResolvedValue(mockUser as never)

      const result = await authService.validateToken(token)

      expect(result).toEqual({
        user: mockUser,
        valid: true,
      })
    })

    it('should throw error for invalid token', async () => {
      const token = 'invalid-token'

      jest.spyOn(jwt, 'decode').mockReturnValue(null)

      await expect(authService.validateToken(token)).rejects.toThrow(ApiError)
    })

    it('should throw error for token without sub', async () => {
      const token = 'token-without-sub'

      jest.spyOn(jwt, 'decode').mockReturnValue({
        email: 'test@example.com',
      } as never)

      await expect(authService.validateToken(token)).rejects.toThrow(ApiError)
    })
  })

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', () => {
      const userId = 'user-id'
      const mockToken = 'mock-refresh-token'

      jest.spyOn(jwt, 'sign').mockReturnValue(mockToken as never)

      const result = authService.generateRefreshToken(userId)

      expect(result).toBe(mockToken)
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId,
          type: 'refresh',
          iat: expect.any(Number),
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
      )
    })
  })

  describe('refreshAccessToken', () => {
    it('should refresh token using Auth0 API when configured', async () => {
      const refreshToken = 'valid-refresh-token'
      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      }

      // Mock successful Auth0 response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await authService.refreshAccessToken(refreshToken)

      expect(result).toEqual({
        accessToken: mockResponse.access_token,
        refreshToken: mockResponse.refresh_token,
        expiresIn: mockResponse.expires_in,
        tokenType: mockResponse.token_type,
        message: 'Token refreshed successfully',
      })

      expect(fetch).toHaveBeenCalledWith(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            refresh_token: refreshToken,
          }),
        })
      )
    })

    it('should throw error when Auth0 not configured', async () => {
      // Temporarily remove Auth0 config
      const originalDomain = process.env.AUTH0_DOMAIN
      const originalClientId = process.env.AUTH0_CLIENT_ID
      const originalClientSecret = process.env.AUTH0_CLIENT_SECRET

      // Clear environment variables
      process.env.AUTH0_DOMAIN = ''
      process.env.AUTH0_CLIENT_ID = ''
      process.env.AUTH0_CLIENT_SECRET = ''

      const refreshToken = 'valid-refresh-token'

      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
        'Auth0 configuration incomplete'
      )

      // Restore original config
      process.env.AUTH0_DOMAIN = originalDomain
      process.env.AUTH0_CLIENT_ID = originalClientId
      process.env.AUTH0_CLIENT_SECRET = originalClientSecret
    })

    it('should handle Auth0 API errors', async () => {
      const refreshToken = 'invalid-refresh-token'
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'invalid_grant' }),
      })

      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(ApiError)
    })

    it('should handle network errors', async () => {
      const refreshToken = 'valid-refresh-token'
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(ApiError)
    })
  })
})
