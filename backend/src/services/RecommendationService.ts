import { PrismaClient } from '@prisma/client'
import { RecommendationError } from '../middleware/errorHandler'
import { logRecommendationGeneration, logger } from '../utils/logger'
import { GeminiService, type StylingRecommendationInput } from './GeminiService'
import { RedisService } from './RedisService'
// import { env } from '../config/env';

export interface RecommendationRequest {
  userId: string
  type:
    | 'styling_recommendations'
    | 'outfit_suggestions'
    | 'seasonal_updates'
    | 'trend_analysis'
    | 'color_matching'
    | 'body_type_optimization'
  context?: {
    occasion?: string
    season?: string
    weather?: string
    garmentIds?: string[]
    excludeGarmentIds?: string[]
  }
  preferences?: {
    maxOutfits?: number
    includeBodyTypeAnalysis?: boolean
    includeColorAnalysis?: boolean
    includeTrendAnalysis?: boolean
  }
}

export interface RecommendationResponse {
  id: string
  recommendationId: string
  type: string
  status: string
  outfits: Array<{
    id: string
    name: string
    description: string
    confidence: number
    occasion: string
    season: string
    weather: string
    items: Array<{
      garmentId: string
      category: string
      displayOrder: number
      stylingNotes?: string
    }>
    stylingTips: string[]
    colorAnalysis?: {
      dominantColors: string[]
      harmonyScore: number
      skinToneCompatibility: number
    }
  }>
  styleAnalysis?: {
    userStyleProfile: string
    improvementSuggestions: string[]
    trendRecommendations: string[]
  }
  personalizationInsights?: {
    stylePreferencesLearned: string[]
    bodyTypeConsiderations: string[]
    seasonalAdjustments: string[]
  }
  metadata: {
    processingTime: number
    confidenceScore: number
    tokensUsed: number
    cost: number
  }
}

export class RecommendationService {
  private static instance: RecommendationService
  private prisma: PrismaClient
  private gemini: GeminiService
  private redis: RedisService

  private constructor() {
    this.prisma = new PrismaClient()
    this.gemini = GeminiService.getInstance()
    this.redis = RedisService.getInstance()
  }

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService()
    }
    return RecommendationService.instance
  }

  public async generateRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    const startTime = Date.now()

    try {
      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: request.userId },
        include: {
          bodyProfiles: true,
          garments: true,
          userStyleProfiles: true,
        },
      })

      if (!user) {
        throw new RecommendationError('User not found', 404)
      }

      // Create recommendation record
      const recommendation = await this.prisma.aiRecommendation.create({
        data: {
          userId: request.userId,
          recommendationId: this.generateRecommendationId(),
          type: request.type,
          status: 'processing',
          occasion: request.context?.occasion,
          season: request.context?.season,
          weather: request.context?.weather,
          context: request.context || {},
        },
      })

      try {
        // Prepare Gemini API input
        const geminiInput = await this.prepareGeminiInput(user, request)

        // Generate recommendations using Gemini
        const geminiResponse = await this.gemini.generateStylingRecommendations(geminiInput)

        // Process and store recommendations
        const processedRecommendations = await this.processRecommendations(
          recommendation.id,
          claudeResponse,
          request.preferences?.maxOutfits || 5
        )

        // Update recommendation status
        await this.prisma.aiRecommendation.update({
          where: { id: recommendation.id },
          data: {
            status: 'completed',
            styleAnalysis: claudeResponse.style_analysis as any,
            personalizationInsights: claudeResponse.personalization_insights as any,
            confidenceScore: this.calculateOverallConfidence(processedRecommendations),
            processingTime: Date.now() - startTime,
          },
        })

        // Update user style profile
        await this.updateUserStyleProfile(user.id, claudeResponse)

        const response: RecommendationResponse = {
          id: recommendation.id,
          recommendationId: recommendation.recommendationId,
          type: recommendation.type,
          status: 'completed',
          outfits: processedRecommendations,
          styleAnalysis: claudeResponse.style_analysis as any,
          personalizationInsights: claudeResponse.personalization_insights as any,
          metadata: {
            processingTime: Date.now() - startTime,
            confidenceScore: this.calculateOverallConfidence(processedRecommendations),
            tokensUsed: 0, // Will be set by Claude service
            cost: 0, // Will be set by Claude service
          },
        }

        // Log successful generation
        logRecommendationGeneration(
          request.userId,
          request.type,
          processedRecommendations.length,
          Date.now() - startTime,
          true
        )

        return response
      } catch (error) {
        // Update recommendation status to failed
        await this.prisma.aiRecommendation.update({
          where: { id: recommendation.id },
          data: {
            status: 'failed',
            processingTime: Date.now() - startTime,
          },
        })

        throw error
      }
    } catch (error) {
      logger.error('Error generating recommendations:', error)

      // Log failed generation
      logRecommendationGeneration(request.userId, request.type, 0, Date.now() - startTime, false)

      throw error instanceof RecommendationError
        ? error
        : new RecommendationError('Failed to generate recommendations')
    }
  }

  public async getRecommendation(recommendationId: string): Promise<RecommendationResponse | null> {
    try {
      const recommendation = await this.prisma.aiRecommendation.findUnique({
        where: { recommendationId },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!recommendation) {
        return null
      }

      // Transform to response format
      const response: RecommendationResponse = {
        id: recommendation.id,
        recommendationId: recommendation.recommendationId,
        type: recommendation.type,
        status: recommendation.status,
        outfits: recommendation.items.map((item: any) => ({
          id: item.outfitId,
          name: item.outfitName,
          description: item.outfitDescription,
          confidence: Number(item.confidenceScore),
          occasion: recommendation.occasion || 'any',
          season: recommendation.season || 'any',
          weather: recommendation.weather || 'any',
          items: Array.isArray(item.garmentIds)
            ? (item.garmentIds as string[]).map((id: string, index: number) => ({
                garmentId: id,
                category: 'unknown',
                displayOrder: index + 1,
              }))
            : [],
          stylingTips: Array.isArray(item.stylingTips) ? item.stylingTips : [],
          colorAnalysis: item.colorAnalysis as any,
        })),
        styleAnalysis: recommendation.styleAnalysis as any,
        personalizationInsights: recommendation.personalizationInsights as any,
        metadata: {
          processingTime: recommendation.processingTime || 0,
          confidenceScore: Number(recommendation.confidenceScore || 0),
          tokensUsed: recommendation.claudeTokensUsed || 0,
          cost: Number(recommendation.claudeCost || 0),
        },
      }

      return response
    } catch (error) {
      logger.error('Error retrieving recommendation:', error)
      throw new RecommendationError('Failed to retrieve recommendation')
    }
  }

  public async submitFeedback(
    userId: string,
    recommendationId: string,
    outfitId: string,
    feedbackType: string,
    rating?: number,
    comment?: string
  ): Promise<void> {
    try {
      const recommendation = await this.prisma.aiRecommendation.findUnique({
        where: { recommendationId },
      })

      if (!recommendation) {
        throw new RecommendationError('Recommendation not found', 404)
      }

      if (recommendation.userId !== userId) {
        throw new RecommendationError('Unauthorized access to recommendation', 403)
      }

      await this.prisma.aiRecommendationFeedback.create({
        data: {
          recommendationId: recommendation.id,
          userId,
          outfitId,
          feedbackType: feedbackType as any,
          rating,
          comment,
        },
      })

      // Update user style profile based on feedback
      await this.updateStyleProfileFromFeedback(userId, feedbackType, rating, comment)

      // Invalidate recommendation cache
      await this.redis.invalidateRecommendationCache(userId)
    } catch (error) {
      logger.error('Error submitting feedback:', error)
      throw error instanceof RecommendationError
        ? error
        : new RecommendationError('Failed to submit feedback')
    }
  }

  private async prepareGeminiInput(
    user: any,
    request: RecommendationRequest
  ): Promise<StylingRecommendationInput> {
    const bodyProfile = user.bodyProfiles[0] || {}
    const userStyleProfile = user.userStyleProfiles[0] || {}

    // Filter garments based on request context
    let garments = user.garments
    if (request.context?.garmentIds) {
      garments = garments.filter((g: any) => request.context?.garmentIds?.includes(g.id))
    }
    if (request.context?.excludeGarmentIds) {
      garments = garments.filter((g: any) => !request.context?.excludeGarmentIds?.includes(g.id))
    }

    return {
      userId: user.id,
      userProfile: {
        gender: user.gender,
        age: user.birthDate
          ? new Date().getFullYear() - new Date(user.birthDate).getFullYear()
          : undefined,
        preferences: {
          style: userStyleProfile.dominantStyles?.[0] || user.preferences?.style,
          colors: userStyleProfile.colorPreferences || user.preferences?.colors,
          brands: userStyleProfile.brandPreferences || user.preferences?.brands,
        },
      },
      bodyProfile: {
        height: bodyProfile.height,
        weight: bodyProfile.weight,
        bodyType: bodyProfile.bodyType,
        skinTone: bodyProfile.skinTone,
        measurements: bodyProfile.measurements,
      },
      garments: garments.map((g: any) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        subcategory: g.subcategory,
        brand: g.brand,
        color: g.color,
        size: g.size,
        material: g.material,
        tags: g.tags,
      })),
      context: {
        occasion: request.context?.occasion,
        season: request.context?.season,
        weather: request.context?.weather,
        timezone: 'Asia/Tokyo', // Default timezone
      },
    }
  }

  private async processRecommendations(
    recommendationId: string,
    claudeResponse: any,
    maxOutfits: number
  ): Promise<any[]> {
    const outfits = claudeResponse.outfits.slice(0, maxOutfits)
    const processedOutfits = []

    for (let i = 0; i < outfits.length; i++) {
      const outfit = outfits[i]

      // Create recommendation item
      await this.prisma.aiRecommendationItem.create({
        data: {
          recommendationId,
          outfitId: outfit.id,
          outfitName: outfit.name,
          outfitDescription: outfit.description,
          displayOrder: i + 1,
          confidenceScore: outfit.confidence,
          colorAnalysis: outfit.color_analysis,
          stylingTips: outfit.styling_tips,
          garmentIds: outfit.items.map((item: any) => item.garmentId),
        },
      })

      processedOutfits.push({
        id: outfit.id,
        name: outfit.name,
        description: outfit.description,
        confidence: outfit.confidence,
        occasion: outfit.occasion,
        season: outfit.season,
        weather: outfit.weather,
        items: outfit.items,
        stylingTips: outfit.styling_tips,
        colorAnalysis: outfit.color_analysis,
      })
    }

    return processedOutfits
  }

  private async updateUserStyleProfile(userId: string, claudeResponse: any): Promise<void> {
    const styleAnalysis = claudeResponse.style_analysis
    const personalizationInsights = claudeResponse.personalization_insights

    if (!styleAnalysis) return

    try {
      await this.prisma.userStyleProfile.upsert({
        where: { userId },
        update: {
          styleProfile: styleAnalysis.userStyleProfile,
          dominantStyles: styleAnalysis.dominantStyles || [],
          colorPreferences: personalizationInsights?.stylePreferencesLearned || [],
          bodyTypeConsiderations: personalizationInsights?.bodyTypeConsiderations || [],
          improvementAreas: styleAnalysis.improvementSuggestions || [],
          styleEvolution: styleAnalysis.trendRecommendations?.join(', '),
          lastAnalyzed: new Date(),
        },
        create: {
          userId,
          styleProfile: styleAnalysis.userStyleProfile,
          dominantStyles: styleAnalysis.dominantStyles || [],
          colorPreferences: personalizationInsights?.stylePreferencesLearned || [],
          brandPreferences: [],
          occasionPatterns: {},
          seasonalPatterns: {},
          bodyTypeConsiderations: personalizationInsights?.bodyTypeConsiderations || [],
          improvementAreas: styleAnalysis.improvementSuggestions || [],
          styleEvolution: styleAnalysis.trendRecommendations?.join(', '),
          lastAnalyzed: new Date(),
        },
      })
    } catch (error) {
      logger.error('Error updating user style profile:', error)
    }
  }

  private async updateStyleProfileFromFeedback(
    userId: string,
    _feedbackType: string,
    _rating?: number,
    _comment?: string
  ): Promise<void> {
    // Logic to update style profile based on user feedback
    // This would involve analyzing feedback patterns and updating preferences
    try {
      const styleProfile = await this.prisma.userStyleProfile.findUnique({
        where: { userId },
      })

      if (styleProfile) {
        // Update preferences based on feedback
        // This is a simplified implementation
        await this.prisma.userStyleProfile.update({
          where: { userId },
          data: {
            lastAnalyzed: new Date(),
          },
        })
      }
    } catch (error) {
      logger.error('Error updating style profile from feedback:', error)
    }
  }

  private calculateOverallConfidence(outfits: any[]): number {
    if (outfits.length === 0) return 0

    const totalConfidence = outfits.reduce((sum, outfit) => sum + outfit.confidence, 0)
    return totalConfidence / outfits.length
  }

  private generateRecommendationId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Collaborative filtering algorithm
  public async getCollaborativeRecommendations(userId: string): Promise<any[]> {
    try {
      // Find users with similar preferences
      const similarUsers = await this.findSimilarUsers(userId)

      // Get their favorite outfits
      const recommendations = await this.getOutfitsFromSimilarUsers(similarUsers, userId)

      return recommendations
    } catch (error) {
      logger.error('Error in collaborative filtering:', error)
      return []
    }
  }

  // Content-based filtering algorithm
  public async getContentBasedRecommendations(userId: string): Promise<any[]> {
    try {
      // Get user's style profile
      const styleProfile = await this.prisma.userStyleProfile.findUnique({
        where: { userId },
      })

      if (!styleProfile) return []

      // Find similar garments and outfits
      const recommendations = await this.findSimilarContent(styleProfile)

      return recommendations
    } catch (error) {
      logger.error('Error in content-based filtering:', error)
      return []
    }
  }

  private async findSimilarUsers(_userId: string): Promise<string[]> {
    // Simplified similarity calculation
    // In practice, this would use cosine similarity or other algorithms
    return []
  }

  private async getOutfitsFromSimilarUsers(
    _userIds: string[],
    _excludeUserId: string
  ): Promise<any[]> {
    // Get outfits from similar users
    return []
  }

  private async findSimilarContent(_styleProfile: any): Promise<any[]> {
    // Find content similar to user's style profile
    return []
  }

  // Additional methods referenced in the AI routes
  public async getUserStyleProfile(userId: string): Promise<any> {
    try {
      const styleProfile = await this.prisma.userStyleProfile.findUnique({
        where: { userId },
      })
      return styleProfile
    } catch (error) {
      logger.error('Error getting user style profile:', error)
      throw new RecommendationError('Failed to get user style profile')
    }
  }

  public async analyzeUserStyle(userId: string, forceRefresh = false): Promise<any> {
    try {
      // Check if we need to refresh or if profile is outdated
      const existingProfile = await this.prisma.userStyleProfile.findUnique({
        where: { userId },
      })

      if (existingProfile && !forceRefresh) {
        const hoursSinceLastAnalysis = existingProfile.lastAnalyzed
          ? (Date.now() - existingProfile.lastAnalyzed.getTime()) / (1000 * 60 * 60)
          : 24 // Default to 24 hours if never analyzed

        if (hoursSinceLastAnalysis < 24) {
          return existingProfile
        }
      }

      // Get user data for analysis
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          garments: true,
          outfits: true,
        },
      })

      if (!user) {
        throw new RecommendationError('User not found', 404)
      }

      // Analyze user style using Gemini
      const analysis = await this.gemini.analyzeUserStyleProfile(
        userId,
        user.preferences,
        user.garments
      )

      // Save analysis to database
      await this.prisma.userStyleProfile.upsert({
        where: { userId },
        update: {
          styleProfile: analysis.style_profile,
          dominantStyles: analysis.dominant_styles,
          colorPreferences: analysis.color_preferences,
          brandPreferences: analysis.brand_preferences,
          occasionPatterns: analysis.occasion_patterns,
          seasonalPatterns: analysis.seasonal_patterns,
          improvementAreas: analysis.recommendations?.improve_areas,
          suggestedPurchases: analysis.recommendations?.suggested_purchases,
          styleEvolution: analysis.recommendations?.style_evolution,
          lastAnalyzed: new Date(),
        },
        create: {
          userId,
          styleProfile: analysis.style_profile,
          dominantStyles: analysis.dominant_styles,
          colorPreferences: analysis.color_preferences,
          brandPreferences: analysis.brand_preferences,
          occasionPatterns: analysis.occasion_patterns,
          seasonalPatterns: analysis.seasonal_patterns,
          improvementAreas: analysis.recommendations?.improve_areas,
          suggestedPurchases: analysis.recommendations?.suggested_purchases,
          styleEvolution: analysis.recommendations?.style_evolution,
          lastAnalyzed: new Date(),
        },
      })

      return analysis
    } catch (error) {
      logger.error('Error analyzing user style:', error)
      throw error instanceof RecommendationError
        ? error
        : new RecommendationError('Failed to analyze user style')
    }
  }

  public async getCurrentTrends(season?: string, category?: string, limit = 10): Promise<any[]> {
    try {
      // This would typically fetch from a trends API or database
      // For now, returning mock data
      const mockTrends = [
        {
          id: 'trend_1',
          name: 'Oversized Blazers',
          category: 'tops',
          season: 'fall',
          popularity: 0.85,
          description: 'Structured oversized blazers are trending this season',
        },
        {
          id: 'trend_2',
          name: 'Earth Tones',
          category: 'colors',
          season: 'fall',
          popularity: 0.78,
          description: 'Warm earth tones like terracotta and olive green',
        },
      ]

      let filteredTrends = mockTrends

      if (season) {
        filteredTrends = filteredTrends.filter(trend => trend.season === season)
      }

      if (category) {
        filteredTrends = filteredTrends.filter(trend => trend.category === category)
      }

      return filteredTrends.slice(0, limit)
    } catch (error) {
      logger.error('Error getting current trends:', error)
      return []
    }
  }

  public async generateColorPalette(userId: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          bodyProfiles: true,
          userStyleProfiles: true,
        },
      })

      if (!user) {
        throw new RecommendationError('User not found', 404)
      }

      const bodyProfile = user.bodyProfiles[0]
      const styleProfile = user.userStyleProfiles[0]

      // Generate color palette based on skin tone and preferences
      const colorPalette = {
        primary: this.getColorsForSkinTone(bodyProfile?.skinTone),
        secondary: styleProfile?.colorPreferences || [],
        accent: this.getAccentColors(bodyProfile?.skinTone),
        neutral: ['black', 'white', 'gray', 'navy', 'beige'],
        seasonal: this.getSeasonalColors(new Date().getMonth()),
      }

      return colorPalette
    } catch (error) {
      logger.error('Error generating color palette:', error)
      throw error instanceof RecommendationError
        ? error
        : new RecommendationError('Failed to generate color palette')
    }
  }

  public async getRecommendationHistory(
    userId: string,
    page = 1,
    limit = 10,
    type?: string
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit

      const where: any = { userId }
      if (type) {
        where.type = type
      }

      const [recommendations, total] = await Promise.all([
        this.prisma.aiRecommendation.findMany({
          where,
          include: {
            items: true,
            feedback: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        this.prisma.aiRecommendation.count({ where }),
      ])

      return {
        data: recommendations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error('Error getting recommendation history:', error)
      throw new RecommendationError('Failed to get recommendation history')
    }
  }

  public async getWeatherBasedRecommendations(
    userId: string,
    location: string,
    includeWeatherData = true
  ): Promise<any> {
    try {
      // This would typically fetch current weather data
      // For now, using mock weather data
      const mockWeather = {
        location,
        temperature: 22,
        condition: 'partly_cloudy',
        humidity: 65,
        windSpeed: 10,
        uvIndex: 5,
        season: this.getCurrentSeason(),
      }

      if (includeWeatherData) {
        // Store weather data for later analysis
        await this.prisma.weatherData.create({
          data: {
            location,
            temperature: mockWeather.temperature,
            condition: mockWeather.condition,
            humidity: mockWeather.humidity,
            windSpeed: mockWeather.windSpeed,
            uvIndex: mockWeather.uvIndex,
            season: mockWeather.season,
            recordedAt: new Date(),
          },
        })
      }

      // Generate recommendations based on weather
      const recommendations = await this.generateRecommendations({
        userId,
        type: 'styling_recommendations',
        context: {
          season: mockWeather.season,
          weather: mockWeather.condition,
          occasion: 'daily',
        },
      })

      return {
        weather: mockWeather,
        recommendations,
      }
    } catch (error) {
      logger.error('Error getting weather-based recommendations:', error)
      throw error instanceof RecommendationError
        ? error
        : new RecommendationError('Failed to get weather-based recommendations')
    }
  }

  private getColorsForSkinTone(skinTone?: string): string[] {
    const colorMap: Record<string, string[]> = {
      warm: ['coral', 'golden yellow', 'warm red', 'peach', 'orange'],
      cool: ['royal blue', 'emerald green', 'cool pink', 'purple', 'silver'],
      neutral: ['teal', 'jade green', 'dusty pink', 'periwinkle', 'coral'],
    }

    return colorMap[skinTone || 'neutral'] || colorMap['neutral'] || []
  }

  private getAccentColors(skinTone?: string): string[] {
    const accentMap: Record<string, string[]> = {
      warm: ['deep burgundy', 'forest green', 'burnt orange'],
      cool: ['deep navy', 'jewel tones', 'cool gray'],
      neutral: ['charcoal', 'olive green', 'dusty rose'],
    }

    return accentMap[skinTone || 'neutral'] || accentMap['neutral'] || []
  }

  private getSeasonalColors(_month: number): string[] {
    const seasonalColors = {
      spring: ['pastels', 'light green', 'soft pink', 'lavender'],
      summer: ['bright colors', 'coral', 'turquoise', 'yellow'],
      fall: ['earth tones', 'burnt orange', 'deep red', 'brown'],
      winter: ['jewel tones', 'deep blue', 'emerald', 'burgundy'],
    }

    const season = this.getCurrentSeason()
    return seasonalColors[season] || seasonalColors.spring
  }

  private getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = new Date().getMonth()

    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }
}
