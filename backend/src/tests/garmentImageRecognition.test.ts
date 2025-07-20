import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { GarmentImageRecognitionService } from '../services/garmentImageRecognitionService'
import { ClaudeService } from '../services/ClaudeService'

// Mock ClaudeService
jest.mock('../services/ClaudeService')

const mockClaudeService = {
  analyzeImageWithVision: jest.fn(),
  getInstance: jest.fn()
}

// Mock the ClaudeService singleton
(ClaudeService.getInstance as jest.Mock).mockReturnValue(mockClaudeService)

describe('GarmentImageRecognitionService', () => {
  let imageRecognitionService: GarmentImageRecognitionService

  beforeEach(() => {
    imageRecognitionService = new GarmentImageRecognitionService()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('analyzeGarmentImage', () => {
    it('should analyze garment image successfully with base64 input', async () => {
      const mockClaudeResponse = JSON.stringify({
        confidence: 95,
        category: 'tops',
        subcategory: 'tshirt',
        name: 'Blue Cotton T-Shirt',
        color: 'Blue',
        colorHex: '#0000FF',
        material: 'Cotton',
        pattern: 'solid',
        style: 'casual',
        season: ['spring', 'summer'],
        tags: ['casual', 'comfortable'],
        description: 'A classic blue cotton t-shirt perfect for casual wear',
        suggestions: {
          alternative_categories: [
            { category: 'tops', subcategory: 'polo', confidence: 75 }
          ],
          alternative_colors: [
            { color: 'Navy', hex: '#000080', confidence: 80 }
          ],
          care_instructions: ['Machine wash cold', 'Tumble dry low'],
          styling_tips: ['Pair with jeans for casual look', 'Layer under jacket for professional look']
        }
      })

      mockClaudeService.analyzeImageWithVision.mockResolvedValue(mockClaudeResponse)

      const result = await imageRecognitionService.analyzeGarmentImage({
        imageBase64: 'mock-base64-string'
      })

      expect(result).toMatchObject({
        confidence: 95,
        category: 'tops',
        subcategory: 'tshirt',
        name: 'Blue Cotton T-Shirt',
        color: 'Blue',
        material: 'Cotton',
        pattern: 'solid',
        style: 'casual'
      })

      expect(mockClaudeService.analyzeImageWithVision).toHaveBeenCalledWith({
        image: 'mock-base64-string',
        prompt: expect.stringContaining('You are an expert fashion AI assistant'),
        isBase64: true
      })
    })

    it('should handle invalid category by using fallback', async () => {
      const mockClaudeResponse = JSON.stringify({
        confidence: 85,
        category: 'invalid-category',
        subcategory: 'invalid-subcategory',
        color: 'Blue'
      })

      mockClaudeService.analyzeImageWithVision.mockResolvedValue(mockClaudeResponse)

      const result = await imageRecognitionService.analyzeGarmentImage({
        imageBase64: 'mock-base64-string'
      })

      expect(result.category).toBe('tops') // fallback category
      expect(result.confidence).toBeLessThanOrEqual(30) // confidence reduced for fallback
      expect(result.subcategory).toBeUndefined() // invalid subcategory removed
    })

    it('should validate colors correctly', async () => {
      const mockClaudeResponse = JSON.stringify({
        confidence: 90,
        category: 'tops',
        color: 'Blue' // Valid color from our list
      })

      mockClaudeService.analyzeImageWithVision.mockResolvedValue(mockClaudeResponse)

      const result = await imageRecognitionService.analyzeGarmentImage({
        imageBase64: 'mock-base64-string'
      })

      expect(result.color).toBe('Blue')
      expect(result.colorHex).toBe('#0000FF')
    })

    it('should handle Claude API errors gracefully', async () => {
      mockClaudeService.analyzeImageWithVision.mockRejectedValue(new Error('Claude API Error'))

      await expect(
        imageRecognitionService.analyzeGarmentImage({
          imageBase64: 'mock-base64-string'
        })
      ).rejects.toThrow('Failed to analyze garment image')
    })

    it('should throw error when no image data provided', async () => {
      await expect(
        imageRecognitionService.analyzeGarmentImage({})
      ).rejects.toThrow('Either imageUrl or imageBase64 must be provided')
    })

    it('should include user preferences in analysis prompt', async () => {
      mockClaudeService.analyzeImageWithVision.mockResolvedValue('{"confidence": 50, "category": "tops"}')

      await imageRecognitionService.analyzeGarmentImage({
        imageBase64: 'mock-base64-string',
        userPreferences: {
          preferredBrands: ['Uniqlo', 'H&M'],
          stylePreferences: ['casual', 'minimalist'],
          colorPreferences: ['blue', 'white', 'black']
        }
      })

      const callArgs = mockClaudeService.analyzeImageWithVision.mock.calls[0][0]
      expect(callArgs.prompt).toContain("User's preferred brands: Uniqlo, H&M")
      expect(callArgs.prompt).toContain("User's style preferences: casual, minimalist")
      expect(callArgs.prompt).toContain("User's color preferences: blue, white, black")
    })
  })

  describe('extractColorPalette', () => {
    it('should extract color palette successfully', async () => {
      const mockColorPalette = JSON.stringify([
        { color: 'blue', hex: '#0000FF', percentage: 60 },
        { color: 'white', hex: '#FFFFFF', percentage: 30 },
        { color: 'gray', hex: '#808080', percentage: 10 }
      ])

      mockClaudeService.analyzeImageWithVision.mockResolvedValue(mockColorPalette)

      const result = await imageRecognitionService.extractColorPalette({
        imageBase64: 'mock-base64-string'
      })

      expect(result).toHaveLength(3)
      expect(result[0]).toMatchObject({
        color: 'blue',
        hex: '#0000FF',
        percentage: 60
      })

      expect(mockClaudeService.analyzeImageWithVision).toHaveBeenCalledWith({
        image: 'mock-base64-string',
        prompt: expect.stringContaining('extract the color palette'),
        isBase64: true
      })
    })

    it('should handle invalid JSON response', async () => {
      mockClaudeService.analyzeImageWithVision.mockResolvedValue('Invalid JSON response')

      const result = await imageRecognitionService.extractColorPalette({
        imageBase64: 'mock-base64-string'
      })

      expect(result).toEqual([])
    })

    it('should handle errors gracefully', async () => {
      mockClaudeService.analyzeImageWithVision.mockRejectedValue(new Error('API Error'))

      const result = await imageRecognitionService.extractColorPalette({
        imageBase64: 'mock-base64-string'
      })

      expect(result).toEqual([])
    })
  })

  describe('suggestGarmentName', () => {
    it('should generate name suggestions based on analysis result', async () => {
      const analysisResult = {
        confidence: 90,
        category: 'tops',
        subcategory: 'tshirt',
        color: 'Blue',
        style: 'casual',
        material: 'Cotton',
        brand: 'Uniqlo'
      }

      const suggestions = await imageRecognitionService.suggestGarmentName(analysisResult)

      expect(suggestions).toContain('T-Shirt')
      expect(suggestions).toContain('Blue T-Shirt')
      expect(suggestions).toContain('Casual T-Shirt')
      expect(suggestions).toContain('Cotton T-Shirt')
      expect(suggestions).toContain('Uniqlo T-Shirt')
      expect(suggestions).toHaveLength(5) // Should limit to 5 suggestions
    })

    it('should handle missing analysis data', async () => {
      const analysisResult = {
        confidence: 50,
        category: 'tops'
      }

      const suggestions = await imageRecognitionService.suggestGarmentName(analysisResult)

      expect(suggestions).toHaveLength(0) // No subcategory, so no suggestions
    })

    it('should remove duplicate suggestions', async () => {
      const analysisResult = {
        confidence: 90,
        category: 'tops',
        subcategory: 'tshirt',
        color: 'Blue',
        style: 'Blue' // Same as color to test deduplication
      }

      const suggestions = await imageRecognitionService.suggestGarmentName(analysisResult)

      // Should not have duplicate "Blue T-Shirt"
      const uniqueSuggestions = [...new Set(suggestions)]
      expect(suggestions).toEqual(uniqueSuggestions)
    })
  })

  describe('parseClaudeResponse', () => {
    it('should parse valid JSON response', () => {
      const service = new GarmentImageRecognitionService()
      const validResponse = 'Some text before {"confidence": 90, "category": "tops"} some text after'
      
      // Access private method for testing
      const result = (service as any).parseClaudeResponse(validResponse)
      
      expect(result).toMatchObject({
        confidence: 90,
        category: 'tops'
      })
    })

    it('should return fallback for invalid JSON', () => {
      const service = new GarmentImageRecognitionService()
      const invalidResponse = 'No JSON here at all'
      
      const result = (service as any).parseClaudeResponse(invalidResponse)
      
      expect(result).toMatchObject({
        confidence: 0,
        category: 'tops',
        description: 'Unable to analyze image automatically',
        tags: ['manual-classification-needed']
      })
    })
  })

  describe('validateAndNormalizeResult', () => {
    it('should normalize valid result', () => {
      const service = new GarmentImageRecognitionService()
      const rawResult = {
        confidence: 95,
        category: 'tops',
        subcategory: 'tshirt',
        color: 'Blue',
        tags: ['casual', 'summer', '', 'comfortable'], // includes empty string
        season: ['spring', 'summer', 'invalid-season'], // includes invalid season
        suggestions: {
          alternative_categories: [
            { category: 'tops', subcategory: 'polo', confidence: 80 },
            { category: 'invalid', subcategory: 'test', confidence: 70 } // invalid category
          ]
        }
      }
      
      const result = (service as any).validateAndNormalizeResult(rawResult)
      
      expect(result.confidence).toBe(95)
      expect(result.category).toBe('tops')
      expect(result.subcategory).toBe('tshirt')
      expect(result.color).toBe('Blue')
      expect(result.colorHex).toBe('#0000FF')
      expect(result.tags).toEqual(['casual', 'summer', 'comfortable']) // empty string removed
      expect(result.season).toEqual(['spring', 'summer']) // invalid season removed
      expect(result.suggestions?.alternative_categories).toHaveLength(1) // invalid category removed
    })

    it('should clamp confidence values', () => {
      const service = new GarmentImageRecognitionService()
      const result = (service as any).validateAndNormalizeResult({
        confidence: 150, // Over 100
        category: 'tops'
      })
      
      expect(result.confidence).toBe(100)
    })
  })
})