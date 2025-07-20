import { Router, type Request, type Response } from 'express'
import { GarmentService, type CreateGarmentInput, type UpdateGarmentInput } from '../services/garmentService'
import { GarmentImageRecognitionService } from '../services/garmentImageRecognitionService'
import { 
  GARMENT_CATEGORIES,
  GARMENT_SIZES,
  GARMENT_COLORS,
  GARMENT_MATERIALS,
  COMMON_BRANDS
} from '../utils/garmentCategories'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Initialize services
const getGarmentService = () => {
  return new GarmentService({
    DATABASE_URL: process.env.DATABASE_URL!
  } as any)
}

const getImageRecognitionService = () => {
  return new GarmentImageRecognitionService()
}

// GET /v1/garments - List garments with filtering and pagination
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const garmentService = getGarmentService()

    // Parse query parameters
    const category = req.query.category as string
    const subcategory = req.query.subcategory as string
    const brand = req.query.brand as string
    const color = req.query.color as string
    const size = req.query.size as string
    const material = req.query.material as string
    const condition = req.query.condition as any
    const isFavorite = req.query.favorite === 'true'
    const search = req.query.search as string
    const tags = typeof req.query.tags === 'string' ? req.query.tags.split(',').filter(Boolean) : undefined
    const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined
    const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined
    
    const sortBy = (req.query.sortBy as any) || 'createdAt'
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    const page = parseInt((req.query.page as string) || '1')
    const limit = Math.min(parseInt((req.query.limit as string) || '20'), 100)

    const filters = {
      ...(category && { category }),
      ...(subcategory && { subcategory }),
      ...(brand && { brand }),
      ...(color && { color }),
      ...(size && { size }),
      ...(material && { material }),
      ...(condition && { condition }),
      ...(req.query.favorite && { isFavorite }),
      ...(search && { search }),
      ...(tags && { tags }),
      ...(priceMin !== undefined && { priceMin }),
      ...(priceMax !== undefined && { priceMax }),
    }

    const result = await garmentService.searchGarments({
      userId,
      filters,
      sortBy,
      sortOrder,
      page,
      limit
    })

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })
  })
)

// GET /v1/garments/categories - Get available categories and subcategories  
router.get(
  '/categories',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        categories: GARMENT_CATEGORIES,
        sizes: GARMENT_SIZES,
        colors: GARMENT_COLORS,
        materials: GARMENT_MATERIALS,
        brands: COMMON_BRANDS
      }
    })
  })
)

// GET /v1/garments/favorites - Get favorite garments
router.get(
  '/favorites',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const garmentService = getGarmentService()
    const garments = await garmentService.getFavoriteGarments(userId)

    res.json({
      success: true,
      data: garments
    })
  })
)

// GET /v1/garments/statistics - Get garment statistics
router.get(
  '/statistics',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const garmentService = getGarmentService()
    const statistics = await garmentService.getGarmentStatistics(userId)

    res.json({
      success: true,
      data: statistics
    })
  })
)

// GET /v1/garments/recent - Get recently added garments
router.get(
  '/recent',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const garmentService = getGarmentService()
    const days = parseInt((req.query.days as string) || '30')
    const garments = await garmentService.getRecentGarments(userId, days)

    res.json({
      success: true,
      data: garments
    })
  })
)

// GET /v1/garments/:id - Get a specific garment
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const garmentService = getGarmentService()
    const garment = await garmentService.getGarmentById(userId, req.params.id!)
    
    if (!garment) {
      res.status(404).json({ error: 'Garment not found' })
      return
    }

    res.json({
      success: true,
      data: garment
    })
  })
)

// POST /v1/garments - Create a new garment
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    // Validate required fields
    if (!req.body.name || !req.body.category) {
      res.status(400).json({
        error: 'Name and category are required'
      })
      return
    }

    const garmentService = getGarmentService()
    const garmentData: CreateGarmentInput = {
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory,
      brand: req.body.brand,
      color: req.body.color,
      size: req.body.size,
      material: req.body.material,
      price: req.body.price ? parseFloat(req.body.price) : undefined,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      condition: req.body.condition,
      isFavorite: req.body.isFavorite || false
    }

    const garment = await garmentService.createGarment(userId, garmentData)

    res.status(201).json({
      success: true,
      data: garment
    })
  })
)

// PATCH /v1/garments/:id - Update a garment
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const garmentService = getGarmentService()
    const updateData: UpdateGarmentInput = {
      ...(req.body.name !== undefined && { name: req.body.name }),
      ...(req.body.category !== undefined && { category: req.body.category }),
      ...(req.body.subcategory !== undefined && { subcategory: req.body.subcategory }),
      ...(req.body.brand !== undefined && { brand: req.body.brand }),
      ...(req.body.color !== undefined && { color: req.body.color }),
      ...(req.body.size !== undefined && { size: req.body.size }),
      ...(req.body.material !== undefined && { material: req.body.material }),
      ...(req.body.price !== undefined && { price: req.body.price ? parseFloat(req.body.price) : undefined }),
      ...(req.body.imageUrl !== undefined && { imageUrl: req.body.imageUrl }),
      ...(req.body.tags !== undefined && { tags: req.body.tags }),
      ...(req.body.condition !== undefined && { condition: req.body.condition }),
      ...(req.body.isFavorite !== undefined && { isFavorite: req.body.isFavorite })
    }

    const garment = await garmentService.updateGarment(userId, req.params.id!, updateData)
    if (!garment) {
      res.status(404).json({ error: 'Garment not found' })
      return
    }

    res.json({
      success: true,
      data: garment
    })
  })
)

// DELETE /v1/garments/:id - Delete a garment
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const garmentService = getGarmentService()
    const deleted = await garmentService.deleteGarment(userId, req.params.id!)
    
    if (!deleted) {
      res.status(404).json({ error: 'Garment not found' })
      return
    }

    res.json({
      success: true,
      message: 'Garment deleted successfully'
    })
  })
)

// POST /v1/garments/:id/favorite - Toggle favorite status
router.post(
  '/:id/favorite',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const garmentService = getGarmentService()
    const garment = await garmentService.toggleFavorite(userId, req.params.id!)
    
    if (!garment) {
      res.status(404).json({ error: 'Garment not found' })
      return
    }

    res.json({
      success: true,
      data: garment
    })
  })
)

// PATCH /v1/garments/bulk - Bulk update garments
router.patch(
  '/bulk',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (!req.body.garmentIds || !Array.isArray(req.body.garmentIds) || req.body.garmentIds.length === 0) {
      res.status(400).json({ error: 'garmentIds array is required' })
      return
    }

    const updateData = {
      ...(req.body.category !== undefined && { category: req.body.category }),
      ...(req.body.subcategory !== undefined && { subcategory: req.body.subcategory }),
      ...(req.body.brand !== undefined && { brand: req.body.brand }),
      ...(req.body.color !== undefined && { color: req.body.color }),
      ...(req.body.condition !== undefined && { condition: req.body.condition }),
      ...(req.body.isFavorite !== undefined && { isFavorite: req.body.isFavorite })
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No update data provided' })
      return
    }

    const garmentService = getGarmentService()
    const updatedCount = await garmentService.bulkUpdateGarments(
      userId,
      req.body.garmentIds,
      updateData
    )

    res.json({
      success: true,
      data: {
        updatedCount
      }
    })
  })
)

// POST /v1/garments/analyze-image - Analyze a garment image for automatic classification
router.post(
  '/analyze-image',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (!req.body.imageBase64 && !req.body.imageUrl) {
      res.status(400).json({ 
        error: 'Either imageBase64 or imageUrl is required' 
      })
      return
    }

    const imageRecognitionService = getImageRecognitionService()
    
    try {
      const analysisResult = await imageRecognitionService.analyzeGarmentImage({
        imageBase64: req.body.imageBase64,
        imageUrl: req.body.imageUrl,
        userPreferences: {
          preferredBrands: req.body.userPreferences?.preferredBrands,
          stylePreferences: req.body.userPreferences?.stylePreferences,
          colorPreferences: req.body.userPreferences?.colorPreferences
        }
      })

      res.json({
        success: true,
        data: analysisResult
      })
    } catch (error) {
      console.error('Error analyzing garment image:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze image'
      })
    }
  })
)

// POST /v1/garments/extract-colors - Extract color palette from a garment image
router.post(
  '/extract-colors',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (!req.body.imageBase64 && !req.body.imageUrl) {
      res.status(400).json({ 
        error: 'Either imageBase64 or imageUrl is required' 
      })
      return
    }

    const imageRecognitionService = getImageRecognitionService()
    
    try {
      const colorPalette = await imageRecognitionService.extractColorPalette({
        imageBase64: req.body.imageBase64,
        imageUrl: req.body.imageUrl
      })

      res.json({
        success: true,
        data: {
          colors: colorPalette
        }
      })
    } catch (error) {
      console.error('Error extracting color palette:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract colors'
      })
    }
  })
)

// POST /v1/garments/suggest-names - Get name suggestions based on image analysis
router.post(
  '/suggest-names',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (!req.body.analysisResult) {
      res.status(400).json({ 
        error: 'analysisResult is required' 
      })
      return
    }

    const imageRecognitionService = getImageRecognitionService()
    
    try {
      const nameSuggestions = await imageRecognitionService.suggestGarmentName(req.body.analysisResult)

      res.json({
        success: true,
        data: {
          suggestions: nameSuggestions
        }
      })
    } catch (error) {
      console.error('Error generating name suggestions:', error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate name suggestions'
      })
    }
  })
)

export default router
