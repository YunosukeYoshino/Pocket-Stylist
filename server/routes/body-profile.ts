import { Router } from 'express'
import type { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { createBodyProfileSchema, updateBodyProfileSchema } from '../schemas/user'
import { BodyProfileService } from '../services/bodyProfile'

const router = Router()

// 体型プロファイル取得
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const bodyProfileService = new BodyProfileService(req.prisma)
    const bodyProfile = await bodyProfileService.getBodyProfile(req.user!.sub)

    res.json({
      data: bodyProfile,
      timestamp: new Date().toISOString(),
    })
  })
)

// 体型プロファイル作成
router.post(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    // リクエストボディのバリデーション
    const validatedData = createBodyProfileSchema.parse(req.body)

    const bodyProfileService = new BodyProfileService(req.prisma)
    const bodyProfile = await bodyProfileService.createBodyProfile(req.user!.sub, validatedData)

    res.status(201).json({
      data: bodyProfile,
      message: 'Body profile created successfully',
      timestamp: new Date().toISOString(),
    })
  })
)

// 体型プロファイル更新
router.patch(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    // リクエストボディのバリデーション
    const validatedData = updateBodyProfileSchema.parse(req.body)

    const bodyProfileService = new BodyProfileService(req.prisma)
    const updatedProfile = await bodyProfileService.updateBodyProfile(req.user!.sub, validatedData)

    res.json({
      data: updatedProfile,
      message: 'Body profile updated successfully',
      timestamp: new Date().toISOString(),
    })
  })
)

// 体型プロファイル削除
router.delete(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const bodyProfileService = new BodyProfileService(req.prisma)
    const result = await bodyProfileService.deleteBodyProfile(req.user!.sub)

    res.json({
      data: result,
      timestamp: new Date().toISOString(),
    })
  })
)

export { router as bodyProfileRouter }
