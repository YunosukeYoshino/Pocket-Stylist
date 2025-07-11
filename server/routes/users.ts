import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { updateUserProfileSchema } from '../schemas/user'
import { UserService } from '../services/user'

const router = Router()

// ユーザープロファイル取得
router.get(
  '/profile',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userService = new UserService(req.prisma)
    const userProfile = await userService.getUserProfile(req.user!.sub)

    res.json({
      data: userProfile,
      timestamp: new Date().toISOString(),
    })
  })
)

// ユーザープロファイル更新
router.patch(
  '/profile',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    // リクエストボディのバリデーション
    const validatedData = updateUserProfileSchema.parse(req.body)

    const userService = new UserService(req.prisma)
    const updatedProfile = await userService.updateUserProfile(req.user!.sub, validatedData)

    res.json({
      data: updatedProfile,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
    })
  })
)

// ユーザーアカウント削除
router.delete(
  '/profile',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userService = new UserService(req.prisma)
    const result = await userService.deleteUserProfile(req.user!.sub)

    res.json({
      data: result,
      timestamp: new Date().toISOString(),
    })
  })
)

export { router as userRouter }
