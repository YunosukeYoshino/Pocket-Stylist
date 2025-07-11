import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { loginSchema, refreshTokenSchema } from '../schemas/user'
import { AuthService } from '../services/auth'

const router = Router()

// ログイン
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    // 実際の環境では、Auth0からのコールバックまたはフロントエンドから認証済みのユーザー情報を受け取る
    // ここでは簡単な実装として、リクエストボディからユーザー情報を受け取る

    const { auth0Id, email, name, avatarUrl } = req.body

    if (!auth0Id || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'auth0Id and email are required',
        timestamp: new Date().toISOString(),
      })
    }

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
    const result = await authService.handleLogout(req.user!.sub)

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
  asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        timestamp: new Date().toISOString(),
      })
    }

    const authService = new AuthService(req.prisma)
    const result = await authService.validateToken(token)

    res.json({
      data: result,
      timestamp: new Date().toISOString(),
    })
  })
)

// ユーザー情報取得（認証済み）
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const authService = new AuthService(req.prisma)
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        timestamp: new Date().toISOString(),
      })
    }

    const result = await authService.validateToken(token)

    res.json({
      data: result.user,
      timestamp: new Date().toISOString(),
    })
  })
)

export { router as authRouter }
