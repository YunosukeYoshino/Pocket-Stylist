import {
	type GenerateContentResult,
	type GenerativeModel,
	GoogleGenerativeAI,
} from "@google/generative-ai";
import { env } from "../config/env";
import { logClaudeUsage, logger } from "../utils/logger";
import { RedisService } from "./RedisService";

// Re-export interfaces from ClaudeService for compatibility
export interface StylingRecommendationInput {
	userId: string;
	userProfile: {
		gender?: string;
		age?: number;
		preferences?: {
			style?: string;
			colors?: string[];
			brands?: string[];
		};
	};
	bodyProfile: {
		height?: number;
		weight?: number;
		bodyType?: string;
		skinTone?: string;
		measurements?: Record<string, number>;
	};
	garments: Array<{
		id: string;
		name: string;
		category: string;
		subcategory?: string;
		brand?: string;
		color?: string;
		size?: string;
		material?: string;
		tags?: string[];
	}>;
	context: {
		occasion?: string;
		season?: string;
		weather?: string;
		timezone?: string;
	};
}

export interface StylingRecommendationOutput {
	recommendationId: string;
	outfits: Array<{
		id: string;
		name: string;
		description: string;
		confidence: number;
		occasion: string;
		season: string;
		weather: string;
		items: Array<{
			garmentId: string;
			category: string;
			displayOrder: number;
			styling_notes?: string;
		}>;
		styling_tips: string[];
		color_analysis: {
			dominant_colors: string[];
			harmony_score: number;
			skin_tone_compatibility: number;
		};
	}>;
	style_analysis: {
		user_style_profile: string;
		improvement_suggestions: string[];
		trend_recommendations: string[];
	};
	personalization_insights: {
		style_preferences_learned: string[];
		body_type_considerations: string[];
		seasonal_adjustments: string[];
	};
}

export class GeminiAPIError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
	) {
		super(message);
		this.name = "GeminiAPIError";
	}
}

export class GeminiService {
	private static instance: GeminiService;
	private client: GoogleGenerativeAI;
	private model: GenerativeModel;
	private visionModel: GenerativeModel;
	private redis: RedisService;

	private constructor() {
		this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
		this.model = this.client.getGenerativeModel({
			model: env.GEMINI_MODEL,
			generationConfig: {
				temperature: Number.parseFloat(env.GEMINI_TEMPERATURE),
				topP: Number.parseFloat(env.GEMINI_TOP_P),
				topK: Number.parseInt(env.GEMINI_TOP_K, 10),
				maxOutputTokens: Number.parseInt(env.GEMINI_MAX_TOKENS, 10),
			},
		});
		this.visionModel = this.client.getGenerativeModel({
			model: env.GEMINI_VISION_MODEL,
			generationConfig: {
				temperature: Number.parseFloat(env.GEMINI_TEMPERATURE),
				topP: Number.parseFloat(env.GEMINI_TOP_P),
				topK: Number.parseInt(env.GEMINI_TOP_K, 10),
				maxOutputTokens: Number.parseInt(env.GEMINI_MAX_TOKENS, 10),
			},
		});
		this.redis = RedisService.getInstance();
	}

	public static getInstance(): GeminiService {
		if (!GeminiService.instance) {
			GeminiService.instance = new GeminiService();
		}
		return GeminiService.instance;
	}

	public async generateStylingRecommendations(
		input: StylingRecommendationInput,
	): Promise<StylingRecommendationOutput> {
		const startTime = Date.now();

		try {
			// Check cache first
			const cacheKey = `styling:${input.userId}:${this.hashInput(input)}`;
			const cached =
				await this.redis.getJson<StylingRecommendationOutput>(cacheKey);

			if (cached) {
				logger.info("Returning cached styling recommendations", {
					userId: input.userId,
				});
				return cached;
			}

			const prompt = this.buildStylingPrompt(input);

			const response = await this.model.generateContent(prompt);
			const result = this.parseStylingResponse(response);
			const processingTime = Date.now() - startTime;

			// Cache the result
			await this.redis.setJson(
				cacheKey,
				result,
				Number.parseInt(env.RECOMMENDATION_CACHE_TTL, 10),
			);

			// Log usage (reusing existing logging infrastructure)
			logClaudeUsage(
				input.userId,
				"styling_recommendations",
				this.estimateTokens(prompt), // Estimate input tokens
				this.calculateCost(
					this.estimateTokens(prompt),
					this.estimateTokens(JSON.stringify(result)),
				),
				processingTime,
			);

			return result;
		} catch (error) {
			logger.error(
				"Gemini API error in generateStylingRecommendations:",
				error,
			);
			// Preserve specific parsing errors
			if (error instanceof GeminiAPIError) {
				throw error;
			}
			throw new GeminiAPIError("Failed to generate styling recommendations");
		}
	}

	public async analyzeUserStyleProfile(
		userId: string,
		userPreferences: any,
		garmentHistory: any[],
	): Promise<any> {
		const startTime = Date.now();

		try {
			const prompt = this.buildStyleAnalysisPrompt(
				userId,
				userPreferences,
				garmentHistory,
			);

			const response = await this.model.generateContent(prompt);
			const result = this.parseStyleAnalysisResponse(response);
			const processingTime = Date.now() - startTime;

			// Cache the result
			const cacheKey = `style_profile:${userId}`;
			await this.redis.setJson(
				cacheKey,
				result,
				Number.parseInt(env.CACHE_TTL, 10),
			);

			// Log usage
			logClaudeUsage(
				userId,
				"style_analysis",
				this.estimateTokens(prompt),
				this.calculateCost(
					this.estimateTokens(prompt),
					this.estimateTokens(JSON.stringify(result)),
				),
				processingTime,
			);

			return result;
		} catch (error) {
			logger.error("Gemini API error in analyzeUserStyleProfile:", error);
			throw new GeminiAPIError("Failed to analyze user style profile");
		}
	}

	public async generateOutfitDescription(
		garmentIds: string[],
		occasion: string,
		season: string,
	): Promise<string> {
		const startTime = Date.now();

		try {
			const prompt = this.buildOutfitDescriptionPrompt(
				garmentIds,
				occasion,
				season,
			);

			const response = await this.model.generateContent(prompt);
			const result = this.parseTextResponse(response);
			const processingTime = Date.now() - startTime;

			// Log usage
			logClaudeUsage(
				"system",
				"outfit_description",
				this.estimateTokens(prompt),
				this.calculateCost(
					this.estimateTokens(prompt),
					this.estimateTokens(result),
				),
				processingTime,
			);

			return result;
		} catch (error) {
			logger.error("Gemini API error in generateOutfitDescription:", error);
			// Preserve specific parsing errors
			if (error instanceof GeminiAPIError) {
				throw error;
			}
			throw new GeminiAPIError("Failed to generate outfit description");
		}
	}

	public async analyzeImageWithVision(input: {
		image: string;
		prompt: string;
		isBase64?: boolean;
		userId?: string;
	}): Promise<string> {
		const startTime = Date.now();

		try {
			let imagePart: any;

			if (input.isBase64) {
				// For base64 images, use Gemini's format
				imagePart = {
					inlineData: {
						data: input.image,
						mimeType: "image/jpeg", // Assume JPEG, could be made configurable
					},
				};
			} else {
				// For URLs, Gemini supports direct URL references
				imagePart = {
					fileData: {
						fileUri: input.image,
						mimeType: "image/jpeg",
					},
				};
			}

			const response = await this.visionModel.generateContent([
				input.prompt,
				imagePart,
			]);

			const result = this.parseTextResponse(response);
			const processingTime = Date.now() - startTime;

			// Log usage
			logClaudeUsage(
				input.userId || "system",
				"image_analysis",
				this.estimateTokens(input.prompt),
				this.calculateCost(
					this.estimateTokens(input.prompt),
					this.estimateTokens(result),
				),
				processingTime,
			);

			return result;
		} catch (error) {
			logger.error("Gemini API error in analyzeImageWithVision:", error);
			throw new GeminiAPIError("Failed to analyze image with vision");
		}
	}

	private buildStylingPrompt(input: StylingRecommendationInput): string {
		return `You are a professional stylist AI assistant for Pocket Stylist. Generate personalized styling recommendations based on the user's profile, body type, available garments, and context.

User Profile:
- Gender: ${input.userProfile.gender || "Not specified"}
- Age: ${input.userProfile.age || "Not specified"}
- Style Preferences: ${input.userProfile.preferences?.style || "Not specified"}
- Preferred Colors: ${input.userProfile.preferences?.colors?.join(", ") || "Not specified"}
- Preferred Brands: ${input.userProfile.preferences?.brands?.join(", ") || "Not specified"}

Body Profile:
- Height: ${input.bodyProfile.height || "Not specified"}cm
- Weight: ${input.bodyProfile.weight || "Not specified"}kg
- Body Type: ${input.bodyProfile.bodyType || "Not specified"}
- Skin Tone: ${input.bodyProfile.skinTone || "Not specified"}
- Measurements: ${JSON.stringify(input.bodyProfile.measurements) || "Not specified"}

Available Garments:
${input.garments.map((g) => `- ${g.name} (${g.category}/${g.subcategory || "N/A"}) - ${g.brand || "No brand"}, ${g.color || "No color"}, ${g.size || "No size"}`).join("\n")}

Context:
- Occasion: ${input.context.occasion || "Any"}
- Season: ${input.context.season || "Any"}
- Weather: ${input.context.weather || "Any"}

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
7. Practical styling tips`;
	}

	private buildStyleAnalysisPrompt(
		_userId: string,
		userPreferences: any,
		garmentHistory: any[],
	): string {
		return `Analyze the user's style profile based on their preferences and garment history.

User Preferences:
${JSON.stringify(userPreferences, null, 2)}

Garment History:
${garmentHistory.map((g) => `- ${g.name} (${g.category}) - Worn ${g.wearCount || 0} times`).join("\n")}

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
}`;
	}

	private buildOutfitDescriptionPrompt(
		garmentIds: string[],
		occasion: string,
		season: string,
	): string {
		return `Create a compelling outfit description for a ${occasion} occasion in ${season}.

Garment IDs: ${garmentIds.join(", ")}

Provide a 2-3 sentence description highlighting:
1. The overall style and vibe
2. Key styling elements
3. Why it works for the occasion and season

Keep it engaging and professional.`;
	}

	private parseStylingResponse(
		response: GenerateContentResult,
	): StylingRecommendationOutput {
		try {
			const text = response.response.text();
			const jsonMatch = text.match(/\{[\s\S]*\}/);

			if (!jsonMatch) {
				throw new Error("No JSON found in response");
			}

			const parsed = JSON.parse(jsonMatch[0]);

			return {
				recommendationId: this.generateRecommendationId(),
				outfits: parsed.outfits || [],
				style_analysis: parsed.style_analysis || {},
				personalization_insights: parsed.personalization_insights || {},
			};
		} catch (error) {
			logger.error("Error parsing styling response:", error);
			throw new GeminiAPIError(
				"Failed to parse styling recommendation response",
			);
		}
	}

	private parseStyleAnalysisResponse(response: GenerateContentResult): any {
		try {
			const text = response.response.text();
			const jsonMatch = text.match(/\{[\s\S]*\}/);

			if (!jsonMatch) {
				throw new Error("No JSON found in response");
			}

			return JSON.parse(jsonMatch[0]);
		} catch (error) {
			logger.error("Error parsing style analysis response:", error);
			throw new GeminiAPIError("Failed to parse style analysis response");
		}
	}

	private parseTextResponse(response: GenerateContentResult): string {
		try {
			const text = response.response.text();
			if (!text || text.trim() === "") {
				throw new Error("Empty response received");
			}
			return text;
		} catch (error) {
			logger.error("Error parsing text response:", error);
			throw new GeminiAPIError("Failed to parse text response");
		}
	}

	private generateRecommendationId(): string {
		return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	// Public method for testing
	public estimateTokens(text: string): number {
		// Rough estimation: 1 token ≈ 4 characters for English text
		return Math.ceil(text.length / 4);
	}

	// Public method for testing
	public calculateCost(inputTokens: number, outputTokens: number): number {
		// Gemini pricing (approximate, as of 2024)
		// Note: Gemini has different pricing tiers, this is a rough estimate
		const inputCostPer1K = 0.001; // Much cheaper than Claude
		const outputCostPer1K = 0.002; // Also cheaper than Claude

		return (
			(inputTokens / 1000) * inputCostPer1K +
			(outputTokens / 1000) * outputCostPer1K
		);
	}

	// Public method for testing
	public hashInput(input: any): string {
		const hash = Buffer.from(JSON.stringify(input))
			.toString("base64")
			.replace(/[^a-zA-Z0-9]/g, "");
		return hash.padEnd(32, "0").slice(0, 32);
	}
}
