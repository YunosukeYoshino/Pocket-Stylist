import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'

// Create mocks before importing with proper typing
const mockGarmentService = {
  createGarment: jest.fn() as jest.MockedFunction<any>,
  getGarmentById: jest.fn() as jest.MockedFunction<any>,
  updateGarment: jest.fn() as jest.MockedFunction<any>,
  deleteGarment: jest.fn() as jest.MockedFunction<any>,
  searchGarments: jest.fn() as jest.MockedFunction<any>,
  getGarmentStatistics: jest.fn() as jest.MockedFunction<any>,
  getFavoriteGarments: jest.fn() as jest.MockedFunction<any>,
  getRecentGarments: jest.fn() as jest.MockedFunction<any>,
  toggleFavorite: jest.fn() as jest.MockedFunction<any>,
  bulkUpdateGarments: jest.fn() as jest.MockedFunction<any>,
}

const mockImageRecognitionService = {
  analyzeGarmentImage: jest.fn() as jest.MockedFunction<any>,
  extractColorPalette: jest.fn() as jest.MockedFunction<any>,
  suggestGarmentName: jest.fn() as jest.MockedFunction<any>,
}

// Set up dynamic mocks before any imports
jest.doMock('../services/garmentService', () => ({
  GarmentService: jest.fn().mockImplementation(() => mockGarmentService)
}))

jest.doMock('../services/garmentImageRecognitionService', () => ({
  GarmentImageRecognitionService: class MockGarmentImageRecognitionService {
    analyzeGarmentImage = mockImageRecognitionService.analyzeGarmentImage
    extractColorPalette = mockImageRecognitionService.extractColorPalette
    suggestGarmentName = mockImageRecognitionService.suggestGarmentName
  }
}))

// Import routes after mock setup
const garmentRoutesModule = jest.requireActual('../routes/garment') as any
const garmentRoutes = garmentRoutesModule.default

describe('Garment Routes', () => {
  let app: express.Application
  const mockUserId = 'user-123'
  const mockGarmentId = 'garment-123'

  beforeEach(() => {
    
    app = express()
    app.use(express.json())
    
    // Mock authentication middleware
    app.use('*', (req, res, next) => {
      ;(req as any).user = { sub: mockUserId }
      next()
    })
    
    app.use('/api/v1/garments', garmentRoutes)
    
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /api/v1/garments', () => {
    it('should return paginated garments list', async () => {
      const mockGarments = [
        { id: '1', name: 'T-Shirt 1', category: 'tops' },
        { id: '2', name: 'T-Shirt 2', category: 'tops' }
      ]

      const mockResult = {
        data: mockGarments,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      }

      mockGarmentService.searchGarments.mockResolvedValue(mockResult)

      const response = await request(app)
        .get('/api/v1/garments')
        .query({ category: 'tops', page: '1', limit: '20' })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        data: mockGarments,
        pagination: mockResult.pagination
      })

      expect(mockGarmentService.searchGarments).toHaveBeenCalledWith({
        userId: mockUserId,
        filters: { category: 'tops' },
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 20
      })
    })

    it('should handle search filters', async () => {
      mockGarmentService.searchGarments.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      })

      await request(app)
        .get('/api/v1/garments')
        .query({
          search: 'blue shirt',
          brand: 'Uniqlo',
          priceMin: '20',
          priceMax: '50',
          favorite: 'true'
        })

      expect(mockGarmentService.searchGarments).toHaveBeenCalledWith({
        userId: mockUserId,
        filters: {
          search: 'blue shirt',
          brand: 'Uniqlo',
          priceMin: 20,
          priceMax: 50,
          isFavorite: true
        },
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 20
      })
    })

    it('should return 401 for unauthorized requests', async () => {
      const unauthorizedApp = express()
      unauthorizedApp.use(express.json())
      unauthorizedApp.use('/api/v1/garments', garmentRoutes)

      const response = await request(unauthorizedApp)
        .get('/api/v1/garments')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Unauthorized')
    })
  })

  describe('GET /api/v1/garments/:id', () => {
    it('should return specific garment', async () => {
      const mockGarment = {
        id: mockGarmentId,
        name: 'Blue T-Shirt',
        category: 'tops'
      }

      mockGarmentService.getGarmentById.mockResolvedValue(mockGarment)

      const response = await request(app)
        .get(`/api/v1/garments/${mockGarmentId}`)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        data: mockGarment
      })

      expect(mockGarmentService.getGarmentById).toHaveBeenCalledWith(mockUserId, mockGarmentId)
    })

    it('should return 404 for non-existent garment', async () => {
      mockGarmentService.getGarmentById.mockResolvedValue(null)

      const response = await request(app)
        .get(`/api/v1/garments/${mockGarmentId}`)

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Garment not found')
    })
  })

  describe('POST /api/v1/garments', () => {
    it('should create garment successfully', async () => {
      const newGarment = {
        name: 'Blue T-Shirt',
        category: 'tops',
        subcategory: 'tshirt',
        brand: 'Uniqlo',
        color: 'blue',
        size: 'M',
        price: 29.99
      }

      const mockCreatedGarment = {
        id: mockGarmentId,
        userId: mockUserId,
        ...newGarment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockGarmentService.createGarment.mockResolvedValue(mockCreatedGarment)

      const response = await request(app)
        .post('/api/v1/garments')
        .send(newGarment)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        success: true,
        data: mockCreatedGarment
      })

      expect(mockGarmentService.createGarment).toHaveBeenCalledWith(mockUserId, {
        name: 'Blue T-Shirt',
        category: 'tops',
        subcategory: 'tshirt',
        brand: 'Uniqlo',
        color: 'blue',
        size: 'M',
        material: undefined,
        price: 29.99,
        imageUrl: undefined,
        tags: undefined,
        condition: undefined,
        isFavorite: false
      })
    })

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/garments')
        .send({ name: 'Test' }) // Missing category

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Name and category are required')
    })
  })

  describe('PATCH /api/v1/garments/:id', () => {
    it('should update garment successfully', async () => {
      const updateData = { name: 'Updated T-Shirt', color: 'red' }
      const mockUpdatedGarment = {
        id: mockGarmentId,
        name: 'Updated T-Shirt',
        color: 'red'
      }

      mockGarmentService.updateGarment.mockResolvedValue(mockUpdatedGarment)

      const response = await request(app)
        .patch(`/api/v1/garments/${mockGarmentId}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        data: mockUpdatedGarment
      })

      expect(mockGarmentService.updateGarment).toHaveBeenCalledWith(
        mockUserId, 
        mockGarmentId, 
        updateData
      )
    })

    it('should return 404 for non-existent garment', async () => {
      mockGarmentService.updateGarment.mockResolvedValue(null)

      const response = await request(app)
        .patch(`/api/v1/garments/${mockGarmentId}`)
        .send({ name: 'Updated Name' })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Garment not found')
    })
  })

  describe('DELETE /api/v1/garments/:id', () => {
    it('should delete garment successfully', async () => {
      mockGarmentService.deleteGarment.mockResolvedValue(true)

      const response = await request(app)
        .delete(`/api/v1/garments/${mockGarmentId}`)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        message: 'Garment deleted successfully'
      })

      expect(mockGarmentService.deleteGarment).toHaveBeenCalledWith(mockUserId, mockGarmentId)
    })

    it('should return 404 for non-existent garment', async () => {
      mockGarmentService.deleteGarment.mockResolvedValue(false)

      const response = await request(app)
        .delete(`/api/v1/garments/${mockGarmentId}`)

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Garment not found')
    })
  })

  describe('GET /api/v1/garments/categories', () => {
    it('should return all categories and related data', async () => {
      const response = await request(app)
        .get('/api/v1/garments/categories')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('categories')
      expect(response.body.data).toHaveProperty('sizes')
      expect(response.body.data).toHaveProperty('colors')
      expect(response.body.data).toHaveProperty('materials')
      expect(response.body.data).toHaveProperty('brands')
    })
  })

  describe('GET /api/v1/garments/statistics', () => {
    it('should return garment statistics', async () => {
      const mockStats = {
        totalGarments: 10,
        categoryCounts: { tops: 5, bottoms: 3, outerwear: 2 },
        brandCounts: { Uniqlo: 4, 'H&M': 3, Zara: 3 },
        favoriteCount: 3,
        averagePrice: 45.50,
        totalValue: 455.00,
        recentlyAdded: 2
      }

      mockGarmentService.getGarmentStatistics.mockResolvedValue(mockStats)

      const response = await request(app)
        .get('/api/v1/garments/statistics')

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        data: mockStats
      })

      expect(mockGarmentService.getGarmentStatistics).toHaveBeenCalledWith(mockUserId)
    })
  })

  describe('POST /api/v1/garments/:id/favorite', () => {
    it('should toggle favorite status', async () => {
      const mockGarment = {
        id: mockGarmentId,
        isFavorite: true
      }

      mockGarmentService.toggleFavorite.mockResolvedValue(mockGarment)

      const response = await request(app)
        .post(`/api/v1/garments/${mockGarmentId}/favorite`)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        data: mockGarment
      })

      expect(mockGarmentService.toggleFavorite).toHaveBeenCalledWith(mockUserId, mockGarmentId)
    })
  })

  describe('PATCH /api/v1/garments/bulk', () => {
    it('should bulk update garments', async () => {
      const garmentIds = ['garment-1', 'garment-2', 'garment-3']
      const updateData = { isFavorite: true, category: 'tops' }

      mockGarmentService.bulkUpdateGarments.mockResolvedValue(3)

      const response = await request(app)
        .patch('/api/v1/garments/bulk')
        .send({
          garmentIds,
          ...updateData
        })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        data: { updatedCount: 3 }
      })

      expect(mockGarmentService.bulkUpdateGarments).toHaveBeenCalledWith(
        mockUserId,
        garmentIds,
        updateData
      )
    })

    it('should return 400 for missing garmentIds', async () => {
      const response = await request(app)
        .patch('/api/v1/garments/bulk')
        .send({ isFavorite: true })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('garmentIds array is required')
    })
  })

  describe('POST /api/v1/garments/analyze-image', () => {
    it('should analyze garment image successfully', async () => {
      const mockAnalysisResult = {
        confidence: 95,
        category: 'tops',
        subcategory: 'tshirt',
        color: 'Blue',
        material: 'Cotton'
      }

      mockImageRecognitionService.analyzeGarmentImage.mockResolvedValue(mockAnalysisResult)

      const response = await request(app)
        .post('/api/v1/garments/analyze-image')
        .send({
          imageBase64: 'mock-base64-string'
        })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        data: mockAnalysisResult
      })

      expect(mockImageRecognitionService.analyzeGarmentImage).toHaveBeenCalledWith({
        imageBase64: 'mock-base64-string',
        imageUrl: undefined,
        userPreferences: {
          preferredBrands: undefined,
          stylePreferences: undefined,
          colorPreferences: undefined
        }
      })
    })

    it('should return 400 for missing image data', async () => {
      const response = await request(app)
        .post('/api/v1/garments/analyze-image')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Either imageBase64 or imageUrl is required')
    })

    it('should handle image analysis errors', async () => {
      mockImageRecognitionService.analyzeGarmentImage.mockRejectedValue(
        new Error('Image analysis failed')
      )

      const response = await request(app)
        .post('/api/v1/garments/analyze-image')
        .send({
          imageBase64: 'mock-base64-string'
        })

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Image analysis failed')
    })
  })

  describe('POST /api/v1/garments/extract-colors', () => {
    it('should extract color palette successfully', async () => {
      const mockColorPalette = [
        { color: 'blue', hex: '#0000FF', percentage: 60 },
        { color: 'white', hex: '#FFFFFF', percentage: 40 }
      ]

      mockImageRecognitionService.extractColorPalette.mockResolvedValue(mockColorPalette)

      const response = await request(app)
        .post('/api/v1/garments/extract-colors')
        .send({
          imageBase64: 'mock-base64-string'
        })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        data: { colors: mockColorPalette }
      })
    })
  })

  describe('POST /api/v1/garments/suggest-names', () => {
    it('should suggest garment names', async () => {
      const analysisResult = {
        confidence: 90,
        category: 'tops',
        subcategory: 'tshirt',
        color: 'Blue'
      }

      const mockSuggestions = ['T-Shirt', 'Blue T-Shirt', 'Casual T-Shirt']

      mockImageRecognitionService.suggestGarmentName.mockResolvedValue(mockSuggestions)

      const response = await request(app)
        .post('/api/v1/garments/suggest-names')
        .send({ analysisResult })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        data: { suggestions: mockSuggestions }
      })

      expect(mockImageRecognitionService.suggestGarmentName).toHaveBeenCalledWith(analysisResult)
    })

    it('should return 400 for missing analysisResult', async () => {
      const response = await request(app)
        .post('/api/v1/garments/suggest-names')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('analysisResult is required')
    })
  })
})