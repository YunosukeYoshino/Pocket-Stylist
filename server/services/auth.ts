import type { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { ApiError } from '../middleware/errorHandler'
import { UserService } from './user'

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

  async handleLogout(auth0Id: string) {
    try {
      // ログアウト処理（セッション無効化など）
      // この実装では単純にメッセージを返すだけ
      // 実際の環境では、リフレッシュトークンの無効化などを行う

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
      const decoded = jwt.decode(token) as any

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
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
      { expiresIn: '30d' }
    )
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // リフレッシュトークンの検証
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your_refresh_secret'
      ) as any

      if (decoded.type !== 'refresh') {
        throw new ApiError('Invalid refresh token', 401)
      }

      // 新しいアクセストークンを生成
      // 実際の環境では Auth0 の API を使用してトークンを更新する
      const newAccessToken = jwt.sign(
        {
          sub: decoded.userId,
          iat: Math.floor(Date.now() / 1000),
        },
        process.env.JWT_SECRET || 'your_secret',
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
