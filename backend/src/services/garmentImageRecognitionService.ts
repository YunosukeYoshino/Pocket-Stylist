import { ClaudeService } from './ClaudeService'
import { 
  GARMENT_CATEGORIES, 
  GARMENT_COLORS,
  GARMENT_MATERIALS,
  getColorByName,
  isValidCategory,
  isValidSubcategory
} from '../utils/garmentCategories'

export interface ImageAnalysisResult {
  confidence: number
  category: string
  subcategory?: string
  name?: string
  color?: string
  colorHex?: string
  material?: string
  pattern?: string
  style?: string
  brand?: string
  season?: string[]
  tags?: string[]
  description?: string
  suggestions?: {
    alternative_categories?: Array<{category: string, subcategory?: string, confidence: number}>
    alternative_colors?: Array<{color: string, hex?: string, confidence: number}>
    care_instructions?: string[]
    styling_tips?: string[]
  }
}

export interface ImageRecognitionInput {
  imageUrl?: string
  imageBase64?: string
  userPreferences?: {
    preferredBrands?: string[]
    stylePreferences?: string[]
    colorPreferences?: string[]
  }
}

export class GarmentImageRecognitionService {
  private claudeService: ClaudeService

  constructor() {
    this.claudeService = ClaudeService.getInstance()
  }

  /**
   * Analyze a garment image and extract clothing information
   */
  async analyzeGarmentImage(input: ImageRecognitionInput): Promise<ImageAnalysisResult> {
    try {
      if (!input.imageUrl && !input.imageBase64) {
        throw new Error('Either imageUrl or imageBase64 must be provided')
      }

      const prompt = this.buildAnalysisPrompt(input.userPreferences)
      
      // Prepare image for Claude API
      let imageData: string
      if (input.imageBase64) {
        imageData = input.imageBase64
      } else if (input.imageUrl) {
        // For now, we'll use the URL directly
        // In a production environment, you might want to download and convert to base64
        imageData = input.imageUrl
      } else {
        throw new Error('Image data is required')
      }

      // Call Claude with vision capabilities
      const response = await this.claudeService.analyzeImageWithVision({
        image: imageData,
        prompt,
        isBase64: !!input.imageBase64
      })

      // Parse the structured response
      const analysisResult = this.parseClaudeResponse(response)
      
      // Validate and normalize the results
      const validatedResult = this.validateAndNormalizeResult(analysisResult)

      return validatedResult
    } catch (error) {
      console.error('Error analyzing garment image:', error)
      throw new Error('Failed to analyze garment image')
    }
  }

  /**
   * Build the analysis prompt for Claude
   */
  private buildAnalysisPrompt(userPreferences?: ImageRecognitionInput['userPreferences']): string {
    const categories = GARMENT_CATEGORIES.map(cat => 
      `${cat.id} (${cat.name}): ${cat.subcategories.map(sub => sub.id).join(', ')}`
    ).join('\n')

    const colors = GARMENT_COLORS.map(color => 
      `${color.name} (${color.nameJa}) - ${color.hex}`
    ).join(', ')

    const materials = GARMENT_MATERIALS.join(', ')

    let preferenceContext = ''
    if (userPreferences) {
      if (userPreferences.preferredBrands?.length) {
        preferenceContext += `\nUser's preferred brands: ${userPreferences.preferredBrands.join(', ')}`
      }
      if (userPreferences.stylePreferences?.length) {
        preferenceContext += `\nUser's style preferences: ${userPreferences.stylePreferences.join(', ')}`
      }
      if (userPreferences.colorPreferences?.length) {
        preferenceContext += `\nUser's color preferences: ${userPreferences.colorPreferences.join(', ')}`
      }
    }

    return `You are an expert fashion AI assistant analyzing clothing items. Please analyze this garment image and provide detailed information in JSON format.

Available Categories and Subcategories:
${categories}

Available Colors:
${colors}

Available Materials:
${materials}
${preferenceContext}

Please analyze the garment in the image and respond with a JSON object containing:

{
  "confidence": <0-100 confidence score for the overall analysis>,
  "category": "<primary category from the list above>",
  "subcategory": "<subcategory from the list above, if applicable>",
  "name": "<descriptive name for the garment>",
  "color": "<dominant color name from the color list>",
  "colorHex": "<hex code for the dominant color>",
  "material": "<estimated material from the materials list>",
  "pattern": "<pattern description if visible (solid, striped, checked, floral, etc.)>",
  "style": "<style description (casual, formal, vintage, modern, etc.)>",
  "brand": "<brand name if identifiable, otherwise null>",
  "season": ["<applicable seasons: spring, summer, fall, winter>"],
  "tags": ["<relevant tags describing the garment>"],
  "description": "<detailed description of the garment>",
  "suggestions": {
    "alternative_categories": [
      {"category": "<category>", "subcategory": "<subcategory>", "confidence": <score>}
    ],
    "alternative_colors": [
      {"color": "<color>", "hex": "<hex>", "confidence": <score>}
    ],
    "care_instructions": ["<care instruction 1>", "<care instruction 2>"],
    "styling_tips": ["<styling tip 1>", "<styling tip 2>"]
  }
}

Guidelines:
1. Use only categories and subcategories from the provided lists
2. Use only colors from the provided color list, choose the closest match
3. Use only materials from the provided materials list
4. Provide confidence scores between 0-100
5. Be specific but accurate in your analysis
6. If unsure about a field, use null or a lower confidence score
7. Provide practical styling tips and care instructions
8. Focus on the main garment, ignore accessories unless specifically requested

Respond with only the JSON object, no additional text.`
  }

  /**
   * Parse Claude's response into a structured result
   */
  private parseClaudeResponse(response: string): ImageAnalysisResult {
    try {
      // Clean up the response to extract JSON
      const jsonStart = response.indexOf('{')
      const jsonEnd = response.lastIndexOf('}') + 1
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON found in response')
      }

      const jsonString = response.substring(jsonStart, jsonEnd)
      const parsedResult = JSON.parse(jsonString)

      return parsedResult
    } catch (error) {
      console.error('Error parsing Claude response:', error)
      // Return a fallback result
      return {
        confidence: 0,
        category: 'tops',
        description: 'Unable to analyze image automatically',
        tags: ['manual-classification-needed']
      } as ImageAnalysisResult
    }
  }

  /**
   * Validate and normalize the analysis result
   */
  private validateAndNormalizeResult(result: ImageAnalysisResult): ImageAnalysisResult {
    const normalized: ImageAnalysisResult = {
      confidence: Math.max(0, Math.min(100, result.confidence || 0)),
      category: 'tops' // Default category, will be overridden below if valid
    }

    // Validate category
    if (result.category && isValidCategory(result.category)) {
      normalized.category = result.category
    } else {
      normalized.category = 'tops' // Default fallback
      normalized.confidence = Math.min(normalized.confidence, 30) // Lower confidence for fallback
    }

    // Validate subcategory
    if (result.subcategory && isValidSubcategory(normalized.category, result.subcategory)) {
      normalized.subcategory = result.subcategory
    }

    // Validate color
    if (result.color) {
      const colorMatch = getColorByName(result.color)
      if (colorMatch) {
        normalized.color = colorMatch.name
        normalized.colorHex = colorMatch.hex
      }
    }

    // Validate material
    if (result.material && GARMENT_MATERIALS.includes(result.material)) {
      normalized.material = result.material
    }

    // Copy other fields with basic validation
    if (result.name && typeof result.name === 'string') {
      normalized.name = result.name.trim()
    }

    if (result.pattern && typeof result.pattern === 'string') {
      normalized.pattern = result.pattern.trim()
    }

    if (result.style && typeof result.style === 'string') {
      normalized.style = result.style.trim()
    }

    if (result.brand && typeof result.brand === 'string') {
      normalized.brand = result.brand.trim()
    }

    if (result.description && typeof result.description === 'string') {
      normalized.description = result.description.trim()
    }

    // Validate arrays
    if (Array.isArray(result.season)) {
      normalized.season = result.season.filter(s => 
        ['spring', 'summer', 'fall', 'winter'].includes(s)
      )
    }

    if (Array.isArray(result.tags)) {
      normalized.tags = result.tags.filter(tag => 
        typeof tag === 'string' && tag.trim().length > 0
      ).map(tag => tag.trim().toLowerCase())
    }

    // Validate suggestions
    if (result.suggestions) {
      normalized.suggestions = {}
      
      if (Array.isArray(result.suggestions.alternative_categories)) {
        normalized.suggestions.alternative_categories = result.suggestions.alternative_categories
          .filter(alt => alt.category && isValidCategory(alt.category))
          .map(alt => ({
            category: alt.category,
            subcategory: alt.subcategory && isValidSubcategory(alt.category, alt.subcategory) 
              ? alt.subcategory 
              : undefined,
            confidence: Math.max(0, Math.min(100, alt.confidence || 0))
          }))
      }

      if (Array.isArray(result.suggestions.alternative_colors)) {
        normalized.suggestions.alternative_colors = result.suggestions.alternative_colors
          .filter(alt => alt.color && getColorByName(alt.color))
          .map(alt => {
            const colorMatch = getColorByName(alt.color)
            return {
              color: colorMatch!.name,
              hex: colorMatch!.hex,
              confidence: Math.max(0, Math.min(100, alt.confidence || 0))
            }
          })
      }

      if (Array.isArray(result.suggestions.care_instructions)) {
        normalized.suggestions.care_instructions = result.suggestions.care_instructions
          .filter(instruction => typeof instruction === 'string' && instruction.trim().length > 0)
          .map(instruction => instruction.trim())
      }

      if (Array.isArray(result.suggestions.styling_tips)) {
        normalized.suggestions.styling_tips = result.suggestions.styling_tips
          .filter(tip => typeof tip === 'string' && tip.trim().length > 0)
          .map(tip => tip.trim())
      }
    }

    return normalized
  }

  /**
   * Extract color palette from an image
   */
  async extractColorPalette(input: ImageRecognitionInput): Promise<Array<{color: string, hex: string, percentage: number}>> {
    try {
      const prompt = `Analyze this image and extract the color palette. Return a JSON array of the dominant colors with their approximate percentages:

[
  {"color": "color_name", "hex": "#hexcode", "percentage": 45},
  {"color": "color_name", "hex": "#hexcode", "percentage": 30},
  {"color": "color_name", "hex": "#hexcode", "percentage": 25}
]

Focus on the main garment colors, ignore background. Provide up to 5 colors. Percentages should add up to 100.`

      let imageData: string
      if (input.imageBase64) {
        imageData = input.imageBase64
      } else if (input.imageUrl) {
        imageData = input.imageUrl
      } else {
        throw new Error('Image data is required')
      }

      const response = await this.claudeService.analyzeImageWithVision({
        image: imageData,
        prompt,
        isBase64: !!input.imageBase64
      })

      // Parse the color palette response
      const jsonStart = response.indexOf('[')
      const jsonEnd = response.lastIndexOf(']') + 1
      
      if (jsonStart === -1 || jsonEnd === 0) {
        return []
      }

      const jsonString = response.substring(jsonStart, jsonEnd)
      const colorPalette = JSON.parse(jsonString)

      return Array.isArray(colorPalette) ? colorPalette : []
    } catch (error) {
      console.error('Error extracting color palette:', error)
      return []
    }
  }

  /**
   * Suggest garment name based on analysis
   */
  async suggestGarmentName(analysisResult: ImageAnalysisResult): Promise<string[]> {
    const suggestions: string[] = []

    // Generate name suggestions based on category, subcategory, color, and style
    if (analysisResult.category && analysisResult.subcategory) {
      const category = GARMENT_CATEGORIES.find(cat => cat.id === analysisResult.category)
      const subcategory = category?.subcategories.find(sub => sub.id === analysisResult.subcategory)
      
      if (subcategory) {
        // Basic name
        suggestions.push(subcategory.name)
        
        // With color
        if (analysisResult.color) {
          suggestions.push(`${analysisResult.color} ${subcategory.name}`)
        }
        
        // With style
        if (analysisResult.style) {
          suggestions.push(`${analysisResult.style} ${subcategory.name}`)
        }
        
        // With material
        if (analysisResult.material) {
          suggestions.push(`${analysisResult.material} ${subcategory.name}`)
        }
        
        // With brand
        if (analysisResult.brand) {
          suggestions.push(`${analysisResult.brand} ${subcategory.name}`)
        }
        
        // Combination names
        if (analysisResult.color && analysisResult.style) {
          suggestions.push(`${analysisResult.color} ${analysisResult.style} ${subcategory.name}`)
        }
      }
    }

    // Remove duplicates and return unique suggestions
    return [...new Set(suggestions)].slice(0, 5)
  }
}