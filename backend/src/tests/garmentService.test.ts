import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { GarmentService } from '../services/garmentService'
import type { PrismaClient } from '@prisma/client'
import { 
  GARMENT_CATEGORIES, 
  isValidCategory, 
  isValidSubcategory 
} from '../utils/garmentCategories'

// Mock Prisma Client
const mockPrismaClient = {
  garment: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
} as unknown as jest.Mocked<PrismaClient>

// Mock the database utility
jest.mock('../utils/database', () => ({
  getPrismaClient: jest.fn(() => mockPrismaClient),
}))

describe('GarmentService', () => {
  let garmentService: GarmentService
  const mockUserId = 'user-123'
  const mockGarmentId = 'garment-123'

  beforeEach(() => {
    garmentService = new GarmentService({
      DATABASE_URL: 'postgresql://test'
    } as any)
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('createGarment', () => {
    it('should create a garment successfully', async () => {
      const mockGarment = {
        id: mockGarmentId,
        userId: mockUserId,
        name: 'Blue T-Shirt',
        category: 'tops',
        subcategory: 'tshirt',
        brand: 'Uniqlo',
        color: 'blue',
        size: 'M',
        material: 'Cotton',
        price: 29.99,
        imageUrl: 'https://example.com/image.jpg',
        tags: JSON.stringify(['casual', 'summer']),
        condition: 'new',
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrismaClient.garment.create.mockResolvedValue(mockGarment as any)

      const result = await garmentService.createGarment(mockUserId, {
        name: 'Blue T-Shirt',
        category: 'tops',
        subcategory: 'tshirt',
        brand: 'Uniqlo',
        color: 'blue',
        size: 'M',
        material: 'Cotton',
        price: 29.99,
        imageUrl: 'https://example.com/image.jpg',
        tags: ['casual', 'summer'],
        condition: 'new',
        isFavorite: false
      })

      expect(result).toEqual(mockGarment)
      expect(mockPrismaClient.garment.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          name: 'Blue T-Shirt',
          category: 'tops',
          subcategory: 'tshirt',
          brand: 'Uniqlo',
          color: 'blue',
          size: 'M',
          material: 'Cotton',
          price: 29.99,
          imageUrl: 'https://example.com/image.jpg',
          tags: JSON.stringify(['casual', 'summer']),
          condition: 'new',
          isFavorite: false,
        },
      })
    })

    it('should throw error for invalid category', async () => {
      await expect(
        garmentService.createGarment(mockUserId, {
          name: 'Test Garment',
          category: 'invalid-category'
        })
      ).rejects.toThrow('Invalid category: invalid-category')
    })

    it('should throw error for invalid subcategory', async () => {
      await expect(
        garmentService.createGarment(mockUserId, {
          name: 'Test Garment',
          category: 'tops',
          subcategory: 'invalid-subcategory'
        })
      ).rejects.toThrow('Invalid subcategory: invalid-subcategory for category: tops')
    })
  })

  describe('getGarmentById', () => {
    it('should return garment if found', async () => {
      const mockGarment = {
        id: mockGarmentId,
        userId: mockUserId,
        name: 'Blue T-Shirt',
        category: 'tops'
      }

      mockPrismaClient.garment.findFirst.mockResolvedValue(mockGarment as any)

      const result = await garmentService.getGarmentById(mockUserId, mockGarmentId)

      expect(result).toEqual(mockGarment)
      expect(mockPrismaClient.garment.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockGarmentId,
          userId: mockUserId,
        },
      })
    })

    it('should return null if garment not found', async () => {
      mockPrismaClient.garment.findFirst.mockResolvedValue(null)

      const result = await garmentService.getGarmentById(mockUserId, mockGarmentId)

      expect(result).toBeNull()
    })
  })

  describe('updateGarment', () => {
    it('should update garment successfully', async () => {
      const mockUpdatedGarment = {
        id: mockGarmentId,
        userId: mockUserId,
        name: 'Updated Blue T-Shirt',
        category: 'tops'
      }

      mockPrismaClient.garment.updateMany.mockResolvedValue({ count: 1 })
      mockPrismaClient.garment.findFirst.mockResolvedValue(mockUpdatedGarment as any)

      const result = await garmentService.updateGarment(mockUserId, mockGarmentId, {
        name: 'Updated Blue T-Shirt'
      })

      expect(result).toEqual(mockUpdatedGarment)
      expect(mockPrismaClient.garment.updateMany).toHaveBeenCalledWith({
        where: {
          id: mockGarmentId,
          userId: mockUserId,
        },
        data: {
          name: 'Updated Blue T-Shirt',
        },
      })
    })

    it('should return null if garment not found for update', async () => {
      mockPrismaClient.garment.updateMany.mockResolvedValue({ count: 0 })

      const result = await garmentService.updateGarment(mockUserId, mockGarmentId, {
        name: 'Updated Name'
      })

      expect(result).toBeNull()
    })
  })

  describe('deleteGarment', () => {
    it('should delete garment successfully', async () => {
      mockPrismaClient.garment.deleteMany.mockResolvedValue({ count: 1 })

      const result = await garmentService.deleteGarment(mockUserId, mockGarmentId)

      expect(result).toBe(true)
      expect(mockPrismaClient.garment.deleteMany).toHaveBeenCalledWith({
        where: {
          id: mockGarmentId,
          userId: mockUserId,
        },
      })
    })

    it('should return false if garment not found for deletion', async () => {
      mockPrismaClient.garment.deleteMany.mockResolvedValue({ count: 0 })

      const result = await garmentService.deleteGarment(mockUserId, mockGarmentId)

      expect(result).toBe(false)
    })
  })

  describe('searchGarments', () => {
    it('should search garments with filters and pagination', async () => {
      const mockGarments = [
        { id: '1', name: 'T-Shirt 1', category: 'tops' },
        { id: '2', name: 'T-Shirt 2', category: 'tops' }
      ]

      mockPrismaClient.garment.findMany.mockResolvedValue(mockGarments as any)
      mockPrismaClient.garment.count.mockResolvedValue(2)

      const result = await garmentService.searchGarments({
        userId: mockUserId,
        filters: {
          category: 'tops',
          search: 'shirt'
        },
        sortBy: 'name',
        sortOrder: 'asc',
        page: 1,
        limit: 20
      })

      expect(result.data).toEqual(mockGarments)
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1
      })
    })

    it('should handle price range filters', async () => {
      mockPrismaClient.garment.findMany.mockResolvedValue([])
      mockPrismaClient.garment.count.mockResolvedValue(0)

      await garmentService.searchGarments({
        userId: mockUserId,
        filters: {
          priceMin: 20,
          priceMax: 50
        }
      })

      expect(mockPrismaClient.garment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: {
              gte: 20,
              lte: 50
            }
          })
        })
      )
    })
  })

  describe('getGarmentStatistics', () => {
    it('should return comprehensive statistics', async () => {
      const mockGarments = [
        { category: 'tops', brand: 'Uniqlo', color: 'blue', condition: 'new', price: 30 },
        { category: 'tops', brand: 'H&M', color: 'red', condition: 'good', price: 25 },
        { category: 'bottoms', brand: 'Uniqlo', color: 'blue', condition: 'new', price: 40 }
      ]

      mockPrismaClient.garment.count
        .mockResolvedValueOnce(3) // totalGarments
        .mockResolvedValueOnce(1) // favoriteCount
        .mockResolvedValueOnce(2) // recentlyAdded

      mockPrismaClient.garment.findMany.mockResolvedValue(mockGarments as any)
      mockPrismaClient.garment.aggregate.mockResolvedValue({
        _avg: { price: 31.67 },
        _sum: { price: 95 }
      })

      const result = await garmentService.getGarmentStatistics(mockUserId)

      expect(result).toEqual({
        totalGarments: 3,
        categoryCounts: {
          tops: 2,
          bottoms: 1
        },
        brandCounts: {
          'Uniqlo': 2,
          'H&M': 1
        },
        colorCounts: {
          blue: 2,
          red: 1
        },
        conditionCounts: {
          new: 2,
          good: 1
        },
        favoriteCount: 1,
        averagePrice: 31.67,
        totalValue: 95,
        recentlyAdded: 2
      })
    })
  })

  describe('toggleFavorite', () => {
    it('should toggle favorite status', async () => {
      const mockGarment = {
        id: mockGarmentId,
        userId: mockUserId,
        isFavorite: false
      }

      const mockUpdatedGarment = {
        ...mockGarment,
        isFavorite: true
      }

      mockPrismaClient.garment.findFirst.mockResolvedValue(mockGarment as any)
      mockPrismaClient.garment.updateMany.mockResolvedValue({ count: 1 })
      mockPrismaClient.garment.findFirst.mockResolvedValueOnce(mockUpdatedGarment as any)

      const result = await garmentService.toggleFavorite(mockUserId, mockGarmentId)

      expect(result?.isFavorite).toBe(true)
    })
  })

  describe('bulkUpdateGarments', () => {
    it('should update multiple garments', async () => {
      const garmentIds = ['garment-1', 'garment-2', 'garment-3']
      mockPrismaClient.garment.updateMany.mockResolvedValue({ count: 3 })

      const result = await garmentService.bulkUpdateGarments(
        mockUserId,
        garmentIds,
        { isFavorite: true }
      )

      expect(result).toBe(3)
      expect(mockPrismaClient.garment.updateMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: garmentIds
          },
          userId: mockUserId
        },
        data: {
          isFavorite: true
        }
      })
    })
  })
})

describe('Garment Categories Validation', () => {
  it('should validate categories correctly', () => {
    expect(isValidCategory('tops')).toBe(true)
    expect(isValidCategory('bottoms')).toBe(true)
    expect(isValidCategory('invalid')).toBe(false)
  })

  it('should validate subcategories correctly', () => {
    expect(isValidSubcategory('tops', 'tshirt')).toBe(true)
    expect(isValidSubcategory('tops', 'invalid')).toBe(false)
    expect(isValidSubcategory('invalid', 'tshirt')).toBe(false)
  })

  it('should have all required categories', () => {
    const expectedCategories = ['tops', 'bottoms', 'outerwear', 'footwear', 'accessories']
    const actualCategories = GARMENT_CATEGORIES.map(cat => cat.id)
    
    for (const category of expectedCategories) {
      expect(actualCategories).toContain(category)
    }
  })
})