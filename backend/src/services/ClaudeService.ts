import Anthropic from '@anthropic-ai/sdk'
import { env } from '../config/env'
import { ClaudeAPIError } from '../middleware/errorHandler'
import { logClaudeUsage, logger } from '../utils/logger'
import { RedisService } from './RedisService'

export interface StylingRecommendationInput {
  userId: string
  userProfile: {
    gender?: string
    age?: number
    preferences?: {
      style?: string
      colors?: string[]
      brands?: string[]
    }
  }
  bodyProfile: {
    height?: number
    weight?: number
    bodyType?: string
    skinTone?: string
    measurements?: Record<string, number>
  }
  garments: Array<{
    id: string
    name: string
    category: string
    subcategory?: string
    brand?: string
    color?: string
    size?: string
    material?: string
    tags?: string[]
  }>
  context: {
    occasion?: string
    season?: string
    weather?: string
    timezone?: string
  }
}

export interface StylingRecommendationOutput {
  recommendationId: string
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
      styling_notes?: string
    }>
    styling_tips: string[]
    color_analysis: {
      dominant_colors: string[]
      harmony_score: number
      skin_tone_compatibility: number
    }
  }>
  style_analysis: {
    user_style_profile: string
    improvement_suggestions: string[]
    trend_recommendations: string[]
  }
  personalization_insights: {
    style_preferences_learned: string[]
    body_type_considerations: string[]
    seasonal_adjustments: string[]
  }
}

export class ClaudeService {
  private static instance: ClaudeService
  private client: Anthropic
  private redis: RedisService

  private constructor() {
    this.client = new Anthropic({
      apiKey: env.CLAUDE_API_KEY,
    })
    this.redis = RedisService.getInstance()
  }

  public static getInstance(): ClaudeService {
    if (!ClaudeService.instance) {
      ClaudeService.instance = new ClaudeService()
    }
    return ClaudeService.instance
  }

  public async generateStylingRecommendations(
    input: StylingRecommendationInput
  ): Promise<StylingRecommendationOutput> {
    const startTime = Date.now()

    try {
      // Check cache first
      const cacheKey = `styling:${input.userId}:${this.hashInput(input)}`
      const cached = await this.redis.getJson<StylingRecommendationOutput>(cacheKey)

      if (cached) {
        logger.info('Returning cached styling recommendations', { userId: input.userId })
        return cached
      }

      const prompt = this.buildStylingPrompt(input)

      const response = await this.client.messages.create({
        model: env.CLAUDE_MODEL,
        max_tokens: Number.parseInt(env.CLAUDE_MAX_TOKENS, 10),
        temperature: Number.parseFloat(env.CLAUDE_TEMPERATURE),
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const result = this.parseStylingResponse(response.content[0])
      const processingTime = Date.now() - startTime

      // Cache the result
      await this.redis.setJson(cacheKey, result, Number.parseInt(env.RECOMMENDATION_CACHE_TTL, 10))

      // Log usage
      logClaudeUsage(
        input.userId,
        'styling_recommendations',
        response.usage?.input_tokens || 0,
        this.calculateCost(response.usage?.input_tokens || 0, response.usage?.output_tokens || 0),
        processingTime
      )

      return result
    } catch (error) {
      logger.error('Claude API error in generateStylingRecommendations:', error)
      throw new ClaudeAPIError('Failed to generate styling recommendations')
    }
  }

  public async analyzeUserStyleProfile(
    userId: string,
    userPreferences: any,
    garmentHistory: any[]
  ): Promise<any> {
    const startTime = Date.now()

    try {
      const prompt = this.buildStyleAnalysisPrompt(userId, userPreferences, garmentHistory)

      const response = await this.client.messages.create({
        model: env.CLAUDE_MODEL,
        max_tokens: Number.parseInt(env.CLAUDE_MAX_TOKENS, 10),
        temperature: Number.parseFloat(env.CLAUDE_TEMPERATURE),
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const result = this.parseStyleAnalysisResponse(response.content[0])
      const processingTime = Date.now() - startTime

      // Cache the result
      const cacheKey = `style_profile:${userId}`
      await this.redis.setJson(cacheKey, result, Number.parseInt(env.CACHE_TTL, 10))

      // Log usage
      logClaudeUsage(
        userId,
        'style_analysis',
        response.usage?.input_tokens || 0,
        this.calculateCost(response.usage?.input_tokens || 0, response.usage?.output_tokens || 0),
        processingTime
      )

      return result
    } catch (error) {
      logger.error('Claude API error in analyzeUserStyleProfile:', error)
      throw new ClaudeAPIError('Failed to analyze user style profile')
    }
  }

  public async generateOutfitDescription(
    garmentIds: string[],
    occasion: string,
    season: string
  ): Promise<string> {
    const startTime = Date.now()

    try {
      const prompt = this.buildOutfitDescriptionPrompt(garmentIds, occasion, season)

      const response = await this.client.messages.create({
        model: env.CLAUDE_MODEL,
        max_tokens: 500,
        temperature: Number.parseFloat(env.CLAUDE_TEMPERATURE),
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const result = this.parseTextResponse(response.content[0])
      const processingTime = Date.now() - startTime

      // Log usage
      logClaudeUsage(
        'system',
        'outfit_description',
        response.usage?.input_tokens || 0,
        this.calculateCost(response.usage?.input_tokens || 0, response.usage?.output_tokens || 0),
        processingTime
      )

      return result
    } catch (error) {
      logger.error('Claude API error in generateOutfitDescription:', error)
      throw new ClaudeAPIError('Failed to generate outfit description')
    }
  }

  private buildStylingPrompt(input: StylingRecommendationInput): string {
    return `You are a professional stylist AI assistant for Pocket Stylist. Generate personalized styling recommendations based on the user's profile, body type, available garments, and context.

User Profile:
- Gender: ${input.userProfile.gender || 'Not specified'}
- Age: ${input.userProfile.age || 'Not specified'}
- Style Preferences: ${input.userProfile.preferences?.style || 'Not specified'}
- Preferred Colors: ${input.userProfile.preferences?.colors?.join(', ') || 'Not specified'}
- Preferred Brands: ${input.userProfile.preferences?.brands?.join(', ') || 'Not specified'}

Body Profile:
- Height: ${input.bodyProfile.height || 'Not specified'}cm
- Weight: ${input.bodyProfile.weight || 'Not specified'}kg
- Body Type: ${input.bodyProfile.bodyType || 'Not specified'}
- Skin Tone: ${input.bodyProfile.skinTone || 'Not specified'}
- Measurements: ${JSON.stringify(input.bodyProfile.measurements) || 'Not specified'}

Available Garments:
${input.garments.map(g => `- ${g.name} (${g.category}/${g.subcategory || 'N/A'}) - ${g.brand || 'No brand'}, ${g.color || 'No color'}, ${g.size || 'No size'}`).join('\n')}

Context:
- Occasion: ${input.context.occasion || 'Any'}
- Season: ${input.context.season || 'Any'}
- Weather: ${input.context.weather || 'Any'}

Please provide recommendations in JSON format with the following structure:
{
  "outfits": [
    {
      "id": "outfit_1",
      "name": "Outfit name",
      "description": "Detailed description",
      "confidence": 0.95,
      "occasion": "work",
      "season": "spring",
      "weather": "mild",
      "items": [
        {
          "garmentId": "garment_id",
          "category": "tops",
          "displayOrder": 1,
          "styling_notes": "How to style this item"
        }
      ],
      "styling_tips": ["Tip 1", "Tip 2"],
      "color_analysis": {
        "dominant_colors": ["blue", "white"],
        "harmony_score": 0.9,
        "skin_tone_compatibility": 0.85
      }
    }
  ],
  "style_analysis": {
    "user_style_profile": "Professional casual with modern touches",
    "improvement_suggestions": ["Suggestion 1", "Suggestion 2"],
    "trend_recommendations": ["Trend 1", "Trend 2"]
  },
  "personalization_insights": {
    "style_preferences_learned": ["Preference 1", "Preference 2"],
    "body_type_considerations": ["Consideration 1", "Consideration 2"],
    "seasonal_adjustments": ["Adjustment 1", "Adjustment 2"]
  }
}

Focus on:
1. Body type flattering combinations
2. Color harmony with skin tone
3. Occasion appropriateness
4. Season and weather suitability
5. Personal style preferences
6. Trend awareness
7. Practical styling tips`
  }

  private buildStyleAnalysisPrompt(
    _userId: string,
    userPreferences: any,
    garmentHistory: any[]
  ): string {
    return `Analyze the user's style profile based on their preferences and garment history.

User Preferences:
${JSON.stringify(userPreferences, null, 2)}

Garment History:
${garmentHistory.map(g => `- ${g.name} (${g.category}) - Worn ${g.wearCount || 0} times`).join('\n')}

Provide analysis in JSON format:
{
  "style_profile": "Style description",
  "dominant_styles": ["style1", "style2"],
  "color_preferences": ["color1", "color2"],
  "brand_preferences": ["brand1", "brand2"],
  "occasion_patterns": {
    "work": 0.4,
    "casual": 0.6
  },
  "seasonal_patterns": {
    "spring": 0.25,
    "summer": 0.25,
    "fall": 0.25,
    "winter": 0.25
  },
  "recommendations": {
    "improve_areas": ["area1", "area2"],
    "suggested_purchases": ["item1", "item2"],
    "style_evolution": "Next steps in style journey"
  }
}`
  }

  private buildOutfitDescriptionPrompt(
    garmentIds: string[],
    occasion: string,
    season: string
  ): string {
    return `Create a compelling outfit description for a ${occasion} occasion in ${season}.

Garment IDs: ${garmentIds.join(', ')}

Provide a 2-3 sentence description highlighting:
1. The overall style and vibe
2. Key styling elements
3. Why it works for the occasion and season

Keep it engaging and professional.`
  }

  private parseStylingResponse(content: any): StylingRecommendationOutput {
    try {
      const text = typeof content === 'string' ? content : content.text
      const jsonMatch = text.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        recommendationId: this.generateRecommendationId(),
        outfits: parsed.outfits || [],
        style_analysis: parsed.style_analysis || {},
        personalization_insights: parsed.personalization_insights || {},
      }
    } catch (error) {
      logger.error('Error parsing styling response:', error)
      throw new ClaudeAPIError('Failed to parse styling recommendation response')
    }
  }

  private parseStyleAnalysisResponse(content: any): any {
    try {
      const text = typeof content === 'string' ? content : content.text
      const jsonMatch = text.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      logger.error('Error parsing style analysis response:', error)
      throw new ClaudeAPIError('Failed to parse style analysis response')
    }
  }

  private parseTextResponse(content: any): string {
    try {
      return typeof content === 'string' ? content : content.text
    } catch (error) {
      logger.error('Error parsing text response:', error)
      throw new ClaudeAPIError('Failed to parse text response')
    }
  }

  private hashInput(input: any): string {
    return Buffer.from(JSON.stringify(input)).toString('base64').slice(0, 32)
  }

  private generateRecommendationId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Claude pricing (approximate)
    const inputCostPer1K = 0.003
    const outputCostPer1K = 0.015

    return (inputTokens / 1000) * inputCostPer1K + (outputTokens / 1000) * outputCostPer1K
  }
}
