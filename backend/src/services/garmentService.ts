import type { PrismaClient } from '@prisma/client'
import { getPrismaClient } from '../utils/database'
import { 
  isValidCategory, 
  isValidSubcategory,
  GARMENT_MATERIALS
} from '../utils/garmentCategories'
import type { Env } from '../index'

// Define types locally since Prisma types may not be available during compilation
export type Condition = 'new' | 'like_new' | 'good' | 'fair'

export interface Garment {
  id: string
  userId: string
  name: string
  category: string
  subcategory?: string | null
  brand?: string | null
  color?: string | null
  size?: string | null
  material?: string | null
  price?: number | null
  imageUrl?: string | null
  tags?: any
  condition?: Condition | null
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateGarmentInput {
  name: string
  category: string
  subcategory?: string
  brand?: string
  color?: string
  size?: string
  material?: string
  price?: number
  imageUrl?: string
  tags?: string[]
  condition?: Condition
  isFavorite?: boolean
}

export interface UpdateGarmentInput {
  name?: string
  category?: string
  subcategory?: string
  brand?: string
  color?: string
  size?: string
  material?: string
  price?: number
  imageUrl?: string
  tags?: string[]
  condition?: Condition
  isFavorite?: boolean
}

export interface GarmentFilters {
  category?: string
  subcategory?: string
  brand?: string
  color?: string
  size?: string
  material?: string
  condition?: Condition
  isFavorite?: boolean
  tags?: string[]
  priceMin?: number
  priceMax?: number
  search?: string
}

export interface GarmentSearchOptions {
  userId: string
  filters?: GarmentFilters
  sortBy?: 'name' | 'category' | 'brand' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PaginatedGarmentsResult {
  data: Garment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface GarmentStatistics {
  totalGarments: number
  categoryCounts: Record<string, number>
  brandCounts: Record<string, number>
  colorCounts: Record<string, number>
  conditionCounts: Record<string, number>
  favoriteCount: number
  averagePrice: number
  totalValue: number
  recentlyAdded: number // Last 30 days
}

export class GarmentService {
  private prisma: PrismaClient

  constructor(env: Env) {
    this.prisma = getPrismaClient(env.DATABASE_URL)
  }

  /**
   * Create a new garment for a user
   */
  async createGarment(userId: string, garmentData: CreateGarmentInput): Promise<Garment> {
    // Validate category and subcategory
    if (!isValidCategory(garmentData.category)) {
      throw new Error(`Invalid category: ${garmentData.category}`)
    }

    if (garmentData.subcategory && !isValidSubcategory(garmentData.category, garmentData.subcategory)) {
      throw new Error(`Invalid subcategory: ${garmentData.subcategory} for category: ${garmentData.category}`)
    }

    // Validate material
    if (garmentData.material && !GARMENT_MATERIALS.includes(garmentData.material)) {
      console.warn(`Unknown material: ${garmentData.material}`)
    }

    try {
      const garment = await this.prisma.garment.create({
        data: {
          userId,
          name: garmentData.name,
          category: garmentData.category,
          subcategory: garmentData.subcategory,
          brand: garmentData.brand,
          color: garmentData.color,
          size: garmentData.size,
          material: garmentData.material,
          price: garmentData.price,
          imageUrl: garmentData.imageUrl,
          tags: garmentData.tags ? JSON.stringify(garmentData.tags) : null,
          condition: garmentData.condition,
          isFavorite: garmentData.isFavorite || false,
        },
      })

      return garment
    } catch (error) {
      console.error('Error creating garment:', error)
      throw new Error('Failed to create garment')
    }
  }

  /**
   * Get a garment by ID (with user authorization)
   */
  async getGarmentById(userId: string, garmentId: string): Promise<Garment | null> {
    try {
      const garment = await this.prisma.garment.findFirst({
        where: {
          id: garmentId,
          userId: userId,
        },
      })

      return garment
    } catch (error) {
      console.error('Error getting garment:', error)
      throw new Error('Failed to get garment')
    }
  }

  /**
   * Update a garment
   */
  async updateGarment(
    userId: string,
    garmentId: string,
    updateData: UpdateGarmentInput
  ): Promise<Garment | null> {
    // Validate category and subcategory if provided
    if (updateData.category && !isValidCategory(updateData.category)) {
      throw new Error(`Invalid category: ${updateData.category}`)
    }

    if (updateData.subcategory && updateData.category && 
        !isValidSubcategory(updateData.category, updateData.subcategory)) {
      throw new Error(`Invalid subcategory: ${updateData.subcategory} for category: ${updateData.category}`)
    }

    // Validate material
    if (updateData.material && !GARMENT_MATERIALS.includes(updateData.material)) {
      console.warn(`Unknown material: ${updateData.material}`)
    }

    try {
      const garment = await this.prisma.garment.updateMany({
        where: {
          id: garmentId,
          userId: userId,
        },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.category && { category: updateData.category }),
          ...(updateData.subcategory !== undefined && { subcategory: updateData.subcategory }),
          ...(updateData.brand !== undefined && { brand: updateData.brand }),
          ...(updateData.color !== undefined && { color: updateData.color }),
          ...(updateData.size !== undefined && { size: updateData.size }),
          ...(updateData.material !== undefined && { material: updateData.material }),
          ...(updateData.price !== undefined && { price: updateData.price }),
          ...(updateData.imageUrl !== undefined && { imageUrl: updateData.imageUrl }),
          ...(updateData.tags !== undefined && { tags: updateData.tags ? JSON.stringify(updateData.tags) : null }),
          ...(updateData.condition !== undefined && { condition: updateData.condition }),
          ...(updateData.isFavorite !== undefined && { isFavorite: updateData.isFavorite }),
        },
      })

      if (garment.count === 0) {
        return null
      }

      return await this.getGarmentById(userId, garmentId)
    } catch (error) {
      console.error('Error updating garment:', error)
      throw new Error('Failed to update garment')
    }
  }

  /**
   * Delete a garment
   */
  async deleteGarment(userId: string, garmentId: string): Promise<boolean> {
    try {
      const result = await this.prisma.garment.deleteMany({
        where: {
          id: garmentId,
          userId: userId,
        },
      })

      return result.count > 0
    } catch (error) {
      console.error('Error deleting garment:', error)
      throw new Error('Failed to delete garment')
    }
  }

  /**
   * Search and filter garments with pagination
   */
  async searchGarments(options: GarmentSearchOptions): Promise<PaginatedGarmentsResult> {
    const {
      userId,
      filters = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = options

    // Build where clause
    const whereClause: any = {
      userId: userId,
    }

    if (filters.category) {
      whereClause.category = filters.category
    }

    if (filters.subcategory) {
      whereClause.subcategory = filters.subcategory
    }

    if (filters.brand) {
      whereClause.brand = {
        contains: filters.brand,
        mode: 'insensitive'
      }
    }

    if (filters.color) {
      whereClause.color = {
        contains: filters.color,
        mode: 'insensitive'
      }
    }

    if (filters.size) {
      whereClause.size = filters.size
    }

    if (filters.material) {
      whereClause.material = {
        contains: filters.material,
        mode: 'insensitive'
      }
    }

    if (filters.condition) {
      whereClause.condition = filters.condition
    }

    if (filters.isFavorite !== undefined) {
      whereClause.isFavorite = filters.isFavorite
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      whereClause.price = {}
      if (filters.priceMin !== undefined) {
        whereClause.price.gte = filters.priceMin
      }
      if (filters.priceMax !== undefined) {
        whereClause.price.lte = filters.priceMax
      }
    }

    if (filters.search) {
      whereClause.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          brand: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          color: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          material: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      ]
    }

    if (filters.tags && filters.tags.length > 0) {
      // Search for garments that contain any of the specified tags
      whereClause.tags = {
        path: '$',
        array_contains: filters.tags
      }
    }

    try {
      const skip = (page - 1) * limit

      const [garments, total] = await Promise.all([
        this.prisma.garment.findMany({
          where: whereClause,
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limit,
        }),
        this.prisma.garment.count({
          where: whereClause,
        })
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        data: garments,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    } catch (error) {
      console.error('Error searching garments:', error)
      throw new Error('Failed to search garments')
    }
  }

  /**
   * Get garment statistics for a user
   */
  async getGarmentStatistics(userId: string): Promise<GarmentStatistics> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const [
        totalGarments,
        favoriteCount,
        recentlyAdded,
        garments,
        priceStats
      ] = await Promise.all([
        this.prisma.garment.count({
          where: { userId }
        }),
        this.prisma.garment.count({
          where: { userId, isFavorite: true }
        }),
        this.prisma.garment.count({
          where: { 
            userId,
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        }),
        this.prisma.garment.findMany({
          where: { userId },
          select: {
            category: true,
            brand: true,
            color: true,
            condition: true,
            price: true
          }
        }),
        this.prisma.garment.aggregate({
          where: { 
            userId,
            price: {
              not: null
            }
          },
          _avg: {
            price: true
          },
          _sum: {
            price: true
          }
        })
      ])

      // Calculate category counts
      const categoryCounts: Record<string, number> = {}
      const brandCounts: Record<string, number> = {}
      const colorCounts: Record<string, number> = {}
      const conditionCounts: Record<string, number> = {}

      garments.forEach((garment: any) => {
        // Category counts
        categoryCounts[garment.category] = (categoryCounts[garment.category] || 0) + 1

        // Brand counts
        if (garment.brand) {
          brandCounts[garment.brand] = (brandCounts[garment.brand] || 0) + 1
        }

        // Color counts
        if (garment.color) {
          colorCounts[garment.color] = (colorCounts[garment.color] || 0) + 1
        }

        // Condition counts
        if (garment.condition) {
          conditionCounts[garment.condition] = (conditionCounts[garment.condition] || 0) + 1
        }
      })

      return {
        totalGarments,
        categoryCounts,
        brandCounts,
        colorCounts,
        conditionCounts,
        favoriteCount,
        averagePrice: Number(priceStats._avg.price) || 0,
        totalValue: Number(priceStats._sum.price) || 0,
        recentlyAdded
      }
    } catch (error) {
      console.error('Error getting garment statistics:', error)
      throw new Error('Failed to get garment statistics')
    }
  }

  /**
   * Toggle favorite status of a garment
   */
  async toggleFavorite(userId: string, garmentId: string): Promise<Garment | null> {
    try {
      const garment = await this.getGarmentById(userId, garmentId)
      if (!garment) {
        return null
      }

      return await this.updateGarment(userId, garmentId, {
        isFavorite: !garment.isFavorite
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw new Error('Failed to toggle favorite')
    }
  }

  /**
   * Get garments by category
   */
  async getGarmentsByCategory(userId: string, category: string): Promise<Garment[]> {
    if (!isValidCategory(category)) {
      throw new Error(`Invalid category: ${category}`)
    }

    try {
      const garments = await this.prisma.garment.findMany({
        where: {
          userId,
          category
        },
        orderBy: {
          name: 'asc'
        }
      })

      return garments
    } catch (error) {
      console.error('Error getting garments by category:', error)
      throw new Error('Failed to get garments by category')
    }
  }

  /**
   * Get favorite garments
   */
  async getFavoriteGarments(userId: string): Promise<Garment[]> {
    try {
      const garments = await this.prisma.garment.findMany({
        where: {
          userId,
          isFavorite: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      return garments
    } catch (error) {
      console.error('Error getting favorite garments:', error)
      throw new Error('Failed to get favorite garments')
    }
  }

  /**
   * Get recently added garments
   */
  async getRecentGarments(userId: string, days: number = 30): Promise<Garment[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    try {
      const garments = await this.prisma.garment.findMany({
        where: {
          userId,
          createdAt: {
            gte: cutoffDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return garments
    } catch (error) {
      console.error('Error getting recent garments:', error)
      throw new Error('Failed to get recent garments')
    }
  }

  /**
   * Bulk update garments (useful for batch operations)
   */
  async bulkUpdateGarments(
    userId: string,
    garmentIds: string[],
    updateData: Partial<UpdateGarmentInput>
  ): Promise<number> {
    try {
      const result = await this.prisma.garment.updateMany({
        where: {
          id: {
            in: garmentIds
          },
          userId
        },
        data: {
          ...(updateData.category && { category: updateData.category }),
          ...(updateData.subcategory !== undefined && { subcategory: updateData.subcategory }),
          ...(updateData.brand !== undefined && { brand: updateData.brand }),
          ...(updateData.color !== undefined && { color: updateData.color }),
          ...(updateData.condition !== undefined && { condition: updateData.condition }),
          ...(updateData.isFavorite !== undefined && { isFavorite: updateData.isFavorite }),
        }
      })

      return result.count
    } catch (error) {
      console.error('Error bulk updating garments:', error)
      throw new Error('Failed to bulk update garments')
    }
  }
}