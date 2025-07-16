import { Router } from 'express'
import type { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { auth0LoginSchema, refreshTokenSchema } from '../schemas/user'
import { AuthService } from '../services/auth'
import { UserService } from '../services/user'

const router = Router()

// ログイン - Auth0 authentication flow
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    // 実際の環境では、Auth0からのコールバックまたはフロントエンドから認証済みのユーザー情報を受け取る
    // ここでは簡単な実装として、リクエストボディからユーザー情報を受け取る

    // リクエストボディのバリデーション
    const validatedData = auth0LoginSchema.parse(req.body)
    const { auth0Id, email, name, avatarUrl } = validatedData

    const authService = new AuthService(req.prisma)
    const result = await authService.handleLogin({
      auth0Id,
      email,
      name,
      avatarUrl,
    })

    res.json({
      data: result,
      timestamp: new Date().toISOString(),
    })
  })
)

// トークンリフレッシュ
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    // リクエストボディのバリデーション
    const { refreshToken } = refreshTokenSchema.parse(req.body)

    const authService = new AuthService(req.prisma)
    const result = await authService.refreshAccessToken(refreshToken)

    res.json({
      data: result,
      timestamp: new Date().toISOString(),
    })
  })
)

// ログアウト
router.post(
  '/logout',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const authService = new AuthService(req.prisma)
    const result = await authService.handleLogout(req.user?.sub)

    res.json({
      data: result,
      timestamp: new Date().toISOString(),
    })
  })
)

// トークン検証
router.get(
  '/validate',
  authenticateToken,
  asyncHandler(async (_req: Request, res: Response) => {
    // Token is already validated by authenticateToken middleware
    res.json({
      data: {
        valid: true,
        message: 'Token is valid',
      },
      timestamp: new Date().toISOString(),
    })
  })
)

// ユーザー情報取得（認証済み）
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    // User is already validated by authenticateToken middleware
    // Get user profile directly using req.user.sub
    const userService = new UserService(req.prisma)
    const userProfile = await userService.getUserProfile(req.user?.sub)

    res.json({
      data: userProfile,
      timestamp: new Date().toISOString(),
    })
  })
)

export { router as authRouter }
