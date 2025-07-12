import type { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { ApiError } from '../middleware/errorHandler'
import { UserService } from './user'

// Environment validation
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables are required')
}

interface DecodedToken {
  sub: string
  email?: string
  iat?: number
  exp?: number
  type?: string
  userId?: string
}

export class AuthService {
  private userService: UserService

  constructor(prisma: PrismaClient) {
    this.userService = new UserService(prisma)
  }

  async handleLogin(userData: {
    email: string
    auth0Id: string
    name?: string
    avatarUrl?: string
  }) {
    try {
      // ユーザーを取得または作成
      const user = await this.userService.findOrCreateUser(userData)

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        message: 'Login successful',
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new ApiError('Login failed', 400)
    }
  }

  async handleLogout(_auth0Id: string) {
    try {
      // ログアウト処理（セッション無効化など）
      // この実装では単純にメッセージを返すだけ
      // 実際の環境では、リフレッシュトークンの無効化などを行う
      // TODO: Implement proper logout logic with token invalidation

      return {
        message: 'Logout successful',
      }
    } catch (error) {
      console.error('Logout error:', error)
      throw new ApiError('Logout failed', 400)
    }
  }

  async validateToken(token: string) {
    try {
      // JWTトークンのデコード（検証はmiddlewareで実施済み）
      const decoded = jwt.decode(token) as DecodedToken | null

      if (!decoded || !decoded.sub) {
        throw new ApiError('Invalid token', 401)
      }

      // ユーザー情報を取得
      const user = await this.userService.getUserProfile(decoded.sub)

      return {
        user,
        valid: true,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      console.error('Token validation error:', error)
      throw new ApiError('Token validation failed', 401)
    }
  }

  generateRefreshToken(userId: string): string {
    // リフレッシュトークンの生成
    // 実際の環境では、より安全な方法でトークンを生成し、データベースに保存する
    return jwt.sign(
      {
        userId,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    )
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // リフレッシュトークンの検証
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as DecodedToken

      if (decoded.type !== 'refresh') {
        throw new ApiError('Invalid refresh token', 401)
      }

      // 新しいアクセストークンを生成
      // TODO: 実際の環境では Auth0 の /oauth/token エンドポイントを使用してトークンを更新する
      // This is a simplified implementation - in production, use Auth0's token endpoint
      // with grant_type=refresh_token to get a new, valid access token from Auth0
      const newAccessToken = jwt.sign(
        {
          sub: decoded.userId,
          iat: Math.floor(Date.now() / 1000),
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      )

      return {
        accessToken: newAccessToken,
        message: 'Token refreshed successfully',
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      throw new ApiError('Token refresh failed', 401)
    }
  }
}
