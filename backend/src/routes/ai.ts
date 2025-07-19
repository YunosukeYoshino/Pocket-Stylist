import { type Request, type Response, Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../middleware/errorHandler'
import { ClaudeService } from '../services/ClaudeService'
import { RecommendationService } from '../services/RecommendationService'
import { logUserFeedback, logger } from '../utils/logger'

const router = Router()
const recommendationService = RecommendationService.getInstance()
const claudeService = ClaudeService.getInstance()

// Validation schemas
const stylingRecommendationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum([
    'styling_recommendations',
    'outfit_suggestions',
    'seasonal_updates',
    'trend_analysis',
    'color_matching',
    'body_type_optimization',
  ]),
  context: z
    .object({
      occasion: z.string().optional(),
      season: z.enum(['spring', 'summer', 'fall', 'winter']).optional(),
      weather: z.string().optional(),
      garmentIds: z.array(z.string().uuid()).optional(),
      excludeGarmentIds: z.array(z.string().uuid()).optional(),
    })
    .optional(),
  preferences: z
    .object({
      maxOutfits: z.number().int().min(1).max(10).default(5),
      includeBodyTypeAnalysis: z.boolean().default(true),
      includeColorAnalysis: z.boolean().default(true),
      includeTrendAnalysis: z.boolean().default(true),
    })
    .optional(),
})

const feedbackSchema = z.object({
  userId: z.string().uuid(),
  outfitId: z.string(),
  feedbackType: z.enum([
    'like',
    'dislike',
    'favorite',
    'rating',
    'comment',
    'worn',
    'purchased',
    'skipped',
  ]),
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(500).optional(),
})

// POST /v1/ai/styling-recommendations
router.post(
  '/styling-recommendations',
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = stylingRecommendationSchema.parse(req.body)

    logger.info('Generating styling recommendations', {
      userId: validatedData.userId,
      type: validatedData.type,
      context: validatedData.context,
    })

    const recommendations = await recommendationService.generateRecommendations(validatedData)

    res.json({
      success: true,
      data: recommendations,
    })
  })
)

// GET /v1/ai/recommendations/:id
router.get(
  '/recommendations/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const recommendationId = req.params.id

    if (!recommendationId) {
      res.status(400).json({
        success: false,
        error: 'Recommendation ID is required',
      })
      return
    }

    const recommendation = await recommendationService.getRecommendation(recommendationId)

    if (!recommendation) {
      res.status(404).json({
        success: false,
        error: 'Recommendation not found',
      })
      return
    }

    res.json({
      success: true,
      data: recommendation,
    })
  })
)

// POST /v1/ai/feedback
router.post(
  '/feedback',
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = feedbackSchema.parse(req.body)
    const recommendationId = req.body.recommendationId

    if (!recommendationId) {
      res.status(400).json({
        success: false,
        error: 'Recommendation ID is required',
      })
      return
    }

    await recommendationService.submitFeedback(
      validatedData.userId,
      recommendationId,
      validatedData.outfitId,
      validatedData.feedbackType,
      validatedData.rating,
      validatedData.comment
    )

    // Log user feedback
    logUserFeedback(
      validatedData.userId,
      recommendationId,
      validatedData.feedbackType,
      validatedData.rating || 0
    )

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
    })
  })
)

// GET /v1/ai/user-profile/:userId
router.get(
  '/user-profile/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      })
      return
    }

    // Get user's style profile
    const styleProfile = await recommendationService.getUserStyleProfile(userId)

    if (!styleProfile) {
      res.status(404).json({
        success: false,
        error: 'User style profile not found',
      })
      return
    }

    res.json({
      success: true,
      data: styleProfile,
    })
  })
)

// POST /v1/ai/analyze-style
router.post(
  '/analyze-style',
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      userId: z.string().uuid(),
      forceRefresh: z.boolean().default(false),
    })

    const { userId, forceRefresh } = schema.parse(req.body)

    logger.info('Analyzing user style profile', { userId, forceRefresh })

    const analysis = await recommendationService.analyzeUserStyle(userId, forceRefresh)

    res.json({
      success: true,
      data: analysis,
    })
  })
)

// GET /v1/ai/collaborative-recommendations/:userId
router.get(
  '/collaborative-recommendations/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      })
      return
    }

    const recommendations = await recommendationService.getCollaborativeRecommendations(userId)

    res.json({
      success: true,
      data: recommendations,
    })
  })
)

// GET /v1/ai/content-based-recommendations/:userId
router.get(
  '/content-based-recommendations/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      })
      return
    }

    const recommendations = await recommendationService.getContentBasedRecommendations(userId)

    res.json({
      success: true,
      data: recommendations,
    })
  })
)

// POST /v1/ai/generate-outfit-description
router.post(
  '/generate-outfit-description',
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      garmentIds: z.array(z.string().uuid()).min(1),
      occasion: z.string().min(1),
      season: z.enum(['spring', 'summer', 'fall', 'winter']),
    })

    const { garmentIds, occasion, season } = schema.parse(req.body)

    logger.info('Generating outfit description', { garmentIds, occasion, season })

    const description = await claudeService.generateOutfitDescription(garmentIds, occasion, season)

    res.json({
      success: true,
      data: {
        description,
      },
    })
  })
)

// GET /v1/ai/trends
router.get(
  '/trends',
  asyncHandler(async (req: Request, res: Response) => {
    const query = z.object({
      season: z.enum(['spring', 'summer', 'fall', 'winter']).optional(),
      category: z.string().optional(),
      limit: z
        .string()
        .transform(val => Number.parseInt(val, 10))
        .default('10'),
    })

    const { season, category, limit } = query.parse(req.query)

    // Get current fashion trends
    const trends = await recommendationService.getCurrentTrends(season, category, limit)

    res.json({
      success: true,
      data: trends,
    })
  })
)

// GET /v1/ai/color-palette/:userId
router.get(
  '/color-palette/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      })
      return
    }

    const colorPalette = await recommendationService.generateColorPalette(userId)

    res.json({
      success: true,
      data: colorPalette,
    })
  })
)

// GET /v1/ai/recommendation-history/:userId
router.get(
  '/recommendation-history/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId
    const query = z.object({
      page: z
        .string()
        .transform(val => Number.parseInt(val, 10))
        .default('1'),
      limit: z
        .string()
        .transform(val => Number.parseInt(val, 10))
        .default('10'),
      type: z
        .enum([
          'styling_recommendations',
          'outfit_suggestions',
          'seasonal_updates',
          'trend_analysis',
          'color_matching',
          'body_type_optimization',
        ])
        .optional(),
    })

    const { page, limit, type } = query.parse(req.query)

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      })
      return
    }

    const history = await recommendationService.getRecommendationHistory(userId, page, limit, type)

    res.json({
      success: true,
      data: history,
    })
  })
)

// POST /v1/ai/weather-based-recommendations
router.post(
  '/weather-based-recommendations',
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      userId: z.string().uuid(),
      location: z.string().min(1),
      includeWeatherData: z.boolean().default(true),
    })

    const { userId, location, includeWeatherData } = schema.parse(req.body)

    logger.info('Generating weather-based recommendations', { userId, location })

    const recommendations = await recommendationService.getWeatherBasedRecommendations(
      userId,
      location,
      includeWeatherData
    )

    res.json({
      success: true,
      data: recommendations,
    })
  })
)

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AI service is running',
    timestamp: new Date().toISOString(),
  })
})

export default router
