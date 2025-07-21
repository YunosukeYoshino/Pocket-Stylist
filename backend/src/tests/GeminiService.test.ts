import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'

// Mock environment first
process.env.GEMINI_API_KEY = 'test-api-key'
process.env.GEMINI_MODEL = 'gemini-1.5-pro'
process.env.GEMINI_VISION_MODEL = 'gemini-1.5-pro-vision'
process.env.GEMINI_MAX_TOKENS = '8192'
process.env.GEMINI_TEMPERATURE = '0.7'
process.env.GEMINI_TOP_P = '0.8'
process.env.GEMINI_TOP_K = '40'

// Create mock function first with proper typing
const mockGenerateContent = jest.fn() as jest.MockedFunction<any>

// Set up mock before any imports
jest.doMock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockImplementation(() => ({
      generateContent: mockGenerateContent
    }))
  }))
}))

// Mock RedisService
jest.doMock('../services/RedisService', () => ({
  RedisService: {
    getInstance: jest.fn(() => ({
      getJson: jest.fn(() => Promise.resolve(null)),
      setJson: jest.fn(() => Promise.resolve(true))
    }))
  }
}))

// Import after mock setup
const geminiServiceModule = jest.requireActual('../services/GeminiService') as any
const { GeminiService } = geminiServiceModule

describe('GeminiService', () => {
  let geminiService: any

  beforeEach(() => {
    geminiService = GeminiService.getInstance()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('generateStylingRecommendations', () => {
    const mockInput = {
      userId: 'user-123',
      userProfile: {
        gender: 'female',
        age: 25,
        preferences: {
          style: 'casual',
          colors: ['blue', 'white'],
          brands: ['Uniqlo', 'Zara']
        }
      },
      bodyProfile: {
        height: 165,
        weight: 55,
        bodyType: 'hourglass',
        skinTone: 'warm'
      },
      garments: [
        {
          id: 'garment-1',
          name: 'Blue Denim Jeans',
          category: 'bottoms',
          subcategory: 'jeans',
          brand: 'Uniqlo',
          color: 'blue',
          size: 'M'
        }
      ],
      context: {
        occasion: 'casual',
        season: 'spring',
        weather: 'mild'
      }
    }

    const mockApiResponse = {
      response: {
        text: () => JSON.stringify({
          outfits: [
            {
              id: 'outfit-1',
              name: 'Casual Spring Look',
              description: 'Perfect for a relaxed day out',
              confidence: 0.9,
              occasion: 'casual',
              season: 'spring',
              weather: 'mild',
              items: [
                {
                  garmentId: 'garment-1',
                  category: 'bottoms',
                  displayOrder: 1,
                  styling_notes: 'Pair with a light top'
                }
              ],
              styling_tips: ['Add layers for versatility'],
              color_analysis: {
                dominant_colors: ['blue'],
                harmony_score: 0.8,
                skin_tone_compatibility: 0.9
              }
            }
          ],
          style_analysis: {
            user_style_profile: 'Casual and comfortable',
            improvement_suggestions: ['Try more accessories'],
            trend_recommendations: ['Add spring colors']
          },
          personalization_insights: {
            style_preferences_learned: ['Prefers comfortable fits'],
            body_type_considerations: ['Highlight waist'],
            seasonal_adjustments: ['Lighter fabrics for spring']
          }
        })
      }
    }

    it('should generate styling recommendations successfully', async () => {
      mockGenerateContent.mockResolvedValue(mockApiResponse)

      const result = await geminiService.generateStylingRecommendations(mockInput)

      expect(result).toHaveProperty('recommendationId')
      expect(result.outfits).toHaveLength(1)
      expect(result.outfits[0]).toMatchObject({
        id: 'outfit-1',
        name: 'Casual Spring Look',
        confidence: 0.9
      })
      expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('professional stylist'))
    })

    it('should handle invalid response format gracefully', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Invalid JSON response without proper structure'
        }
      })

      await expect(
        geminiService.generateStylingRecommendations(mockInput)
      ).rejects.toThrow('Failed to parse styling recommendation response')
    })

    it('should handle API errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Gemini API Error'))

      await expect(
        geminiService.generateStylingRecommendations(mockInput)
      ).rejects.toThrow('Failed to generate styling recommendations')
    })

    it('should include all user profile information in prompt', async () => {
      mockGenerateContent.mockResolvedValue(mockApiResponse)

      await geminiService.generateStylingRecommendations(mockInput)

      const calledPrompt = mockGenerateContent.mock.calls[0][0]
      expect(calledPrompt).toContain('Gender: female')
      expect(calledPrompt).toContain('Age: 25')
      expect(calledPrompt).toContain('Style Preferences: casual')
      expect(calledPrompt).toContain('Height: 165cm')
      expect(calledPrompt).toContain('Body Type: hourglass')
    })
  })

  describe('analyzeUserStyleProfile', () => {
    const mockUserPreferences = {
      style: 'minimalist',
      colors: ['black', 'white', 'gray']
    }

    const mockGarmentHistory = [
      { name: 'Black T-Shirt', category: 'tops', wearCount: 5 },
      { name: 'White Jeans', category: 'bottoms', wearCount: 3 }
    ]

    const mockApiResponse = {
      response: {
        text: () => JSON.stringify({
          style_profile: 'Minimalist and clean',
          dominant_styles: ['minimalist', 'casual'],
          color_preferences: ['black', 'white'],
          brand_preferences: ['Uniqlo', 'Muji'],
          occasion_patterns: { work: 0.4, casual: 0.6 },
          seasonal_patterns: { spring: 0.25, summer: 0.25, fall: 0.25, winter: 0.25 },
          recommendations: {
            improve_areas: ['Add more color variety'],
            suggested_purchases: ['Colorful accessories'],
            style_evolution: 'Explore modern minimalism'
          }
        })
      }
    }

    it('should analyze user style profile successfully', async () => {
      mockGenerateContent.mockResolvedValue(mockApiResponse)

      const result = await geminiService.analyzeUserStyleProfile(
        'user-123',
        mockUserPreferences,
        mockGarmentHistory
      )

      expect(result).toMatchObject({
        style_profile: 'Minimalist and clean',
        dominant_styles: ['minimalist', 'casual']
      })
      expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('style profile'))
    })

    it('should handle empty garment history', async () => {
      mockGenerateContent.mockResolvedValue(mockApiResponse)

      await geminiService.analyzeUserStyleProfile('user-123', mockUserPreferences, [])

      expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('Garment History:'))
    })

    it('should handle API errors during style analysis', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Analysis failed'))

      await expect(
        geminiService.analyzeUserStyleProfile('user-123', mockUserPreferences, mockGarmentHistory)
      ).rejects.toThrow('Failed to analyze user style profile')
    })
  })

  describe('generateOutfitDescription', () => {
    const mockApiResponse = {
      response: {
        text: () => 'This elegant ensemble perfectly captures the essence of professional spring styling with its sophisticated color palette and versatile pieces that transition seamlessly from office meetings to casual lunch dates.'
      }
    }

    it('should generate outfit description successfully', async () => {
      mockGenerateContent.mockResolvedValue(mockApiResponse)

      const result = await geminiService.generateOutfitDescription(
        ['garment-1', 'garment-2'],
        'work',
        'spring'
      )

      expect(result).toContain('elegant ensemble')
      expect(result).toContain('professional spring styling')
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Create a compelling outfit description for a work occasion in spring')
      )
    })

    it('should include garment IDs in prompt', async () => {
      mockGenerateContent.mockResolvedValue(mockApiResponse)

      await geminiService.generateOutfitDescription(['garment-1', 'garment-2'], 'casual', 'summer')

      const calledPrompt = mockGenerateContent.mock.calls[0][0]
      expect(calledPrompt).toContain('garment-1, garment-2')
      expect(calledPrompt).toContain('casual occasion in summer')
    })
  })

  describe('analyzeImageWithVision', () => {
    const mockApiResponse = {
      response: {
        text: () => 'This is a blue denim jacket with silver buttons, classic collar, and regular fit. The fabric appears to be medium-weight cotton denim with slight distressing around the edges.'
      }
    }

    it('should analyze base64 image successfully', async () => {
      mockGenerateContent.mockResolvedValue(mockApiResponse)

      const result = await geminiService.analyzeImageWithVision({
        image: 'base64encodedimage==',
        prompt: 'Analyze this garment image',
        isBase64: true,
        userId: 'user-123'
      })

      expect(result).toContain('blue denim jacket')
      expect(mockGenerateContent).toHaveBeenCalledWith([
        'Analyze this garment image',
        {
          inlineData: {
            data: 'base64encodedimage==',
            mimeType: 'image/jpeg'
          }
        }
      ])
    })

    it('should analyze URL image successfully', async () => {
      mockGenerateContent.mockResolvedValue(mockApiResponse)

      const result = await geminiService.analyzeImageWithVision({
        image: 'https://example.com/image.jpg',
        prompt: 'Describe this clothing item',
        isBase64: false,
        userId: 'user-123'
      })

      expect(result).toContain('blue denim jacket')
      expect(mockGenerateContent).toHaveBeenCalledWith([
        'Describe this clothing item',
        {
          fileData: {
            fileUri: 'https://example.com/image.jpg',
            mimeType: 'image/jpeg'
          }
        }
      ])
    })

    it('should handle vision analysis errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Vision API failed'))

      await expect(
        geminiService.analyzeImageWithVision({
          image: 'base64image==',
          prompt: 'Analyze image',
          isBase64: true
        })
      ).rejects.toThrow('Failed to analyze image with vision')
    })

    it('should work without userId parameter', async () => {
      mockGenerateContent.mockResolvedValue(mockApiResponse)

      const result = await geminiService.analyzeImageWithVision({
        image: 'base64image==',
        prompt: 'Analyze image',
        isBase64: true
      })

      expect(result).toContain('blue denim jacket')
    })
  })

  describe('utility methods', () => {
    it('should generate unique recommendation IDs', () => {
      const id1 = geminiService.generateRecommendationId()
      const id2 = geminiService.generateRecommendationId()

      expect(id1).toMatch(/^rec_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^rec_\d+_[a-z0-9]+$/)
      expect(id1).not.toEqual(id2)
    })

    it('should estimate tokens reasonably', () => {
      const shortText = 'Hello'
      const longText = 'This is a much longer text that should have more estimated tokens'

      const shortTokens = geminiService.estimateTokens(shortText)
      const longTokens = geminiService.estimateTokens(longText)

      expect(shortTokens).toBeLessThan(longTokens)
      expect(shortTokens).toBeGreaterThan(0)
    })

    it('should calculate cost based on token estimates', () => {
      const cost = geminiService.calculateCost(1000, 500)

      expect(cost).toBeGreaterThan(0)
      expect(typeof cost).toBe('number')
    })

    it('should hash input consistently', () => {
      const input = { test: 'data' }
      const hash1 = geminiService.hashInput(input)
      const hash2 = geminiService.hashInput(input)

      expect(hash1).toEqual(hash2)
      expect(hash1).toHaveLength(32)
    })
  })

  describe('error handling', () => {
    it('should throw GeminiAPIError on parsing failures', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Not valid JSON at all'
        }
      })

      await expect(
        geminiService.generateStylingRecommendations({
          userId: 'test',
          userProfile: {},
          bodyProfile: {},
          garments: [],
          context: {}
        })
      ).rejects.toThrow('Failed to parse styling recommendation response')
    })

    it('should handle empty responses gracefully', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => ''
        }
      })

      await expect(
        geminiService.generateOutfitDescription(['garment-1'], 'casual', 'spring')
      ).rejects.toThrow('Failed to parse text response')
    })
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = GeminiService.getInstance()
      const instance2 = GeminiService.getInstance()

      expect(instance1).toBe(instance2)
    })
  })
})