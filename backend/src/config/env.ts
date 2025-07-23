import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.string().default("3001"),

	// Database
	DATABASE_URL: z.string().url(),

	// Claude API (Legacy - to be deprecated)
	CLAUDE_API_KEY: z.string().min(1, "Claude API key is required"),
	CLAUDE_MODEL: z.string().default("claude-3-sonnet-20240229"),
	CLAUDE_VISION_MODEL: z.string().default("claude-3-sonnet-20240229"),
	CLAUDE_MAX_TOKENS: z.string().default("4096"),
	CLAUDE_TEMPERATURE: z.string().default("0.7"),

	// Gemini API
	GEMINI_API_KEY: z.string().min(1, "Gemini API key is required"),
	GEMINI_MODEL: z.string().default("gemini-1.5-pro"),
	GEMINI_VISION_MODEL: z.string().default("gemini-1.5-pro-vision"),
	GEMINI_MAX_TOKENS: z.string().default("8192"),
	GEMINI_TEMPERATURE: z.string().default("0.7"),
	GEMINI_TOP_P: z.string().default("0.8"),
	GEMINI_TOP_K: z.string().default("40"),

	// Redis
	REDIS_URL: z.string().url().optional(),
	REDIS_HOST: z.string().default("localhost"),
	REDIS_PORT: z.string().default("6379"),
	REDIS_PASSWORD: z.string().optional(),

	// JWT
	JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
	JWT_EXPIRES_IN: z.string().default("24h"),
	JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

	// CORS
	FRONTEND_URL: z.string().url().default("http://localhost:3000"),

	// Rate limiting
	RATE_LIMIT_WINDOW_MS: z.string().default("900000"), // 15 minutes
	RATE_LIMIT_MAX: z.string().default("100"),
	CLAUDE_RATE_LIMIT_WINDOW_MS: z.string().default("60000"), // 1 minute
	CLAUDE_RATE_LIMIT_MAX: z.string().default("20"),
	GEMINI_RATE_LIMIT_WINDOW_MS: z.string().default("60000"), // 1 minute
	GEMINI_RATE_LIMIT_MAX: z.string().default("60"), // Higher limit for Gemini

	// Logging
	LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
	LOG_FORMAT: z.enum(["json", "simple"]).default("json"),

	// Cache
	CACHE_TTL: z.string().default("3600"), // 1 hour
	RECOMMENDATION_CACHE_TTL: z.string().default("1800"), // 30 minutes

	// AI Configuration
	AI_RECOMMENDATION_BATCH_SIZE: z.string().default("10"),
	AI_MAX_RETRIES: z.string().default("3"),
	AI_RETRY_DELAY: z.string().default("1000"),

	// Weather API (optional)
	WEATHER_API_KEY: z.string().optional(),
	WEATHER_API_URL: z.string().url().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
	try {
		const config = envSchema.parse(process.env);
		return config;
	} catch (error) {
		console.error("Environment validation failed:", error);
		throw new Error("Invalid environment configuration");
	}
}

// Lazy initialization to avoid failing during tests
let _env: EnvConfig | null = null;
export const getEnv = (): EnvConfig => {
	if (!_env) {
		_env = validateEnv();
	}
	return _env;
};

// For backward compatibility
export const env = new Proxy({} as EnvConfig, {
	get(_, prop) {
		return getEnv()[prop as keyof EnvConfig];
	},
});
