import { createClient, type RedisClientType } from "redis";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export class RedisService {
	private static instance: RedisService;
	private client: RedisClientType;

	private constructor() {
		const redisUrl =
			env.REDIS_URL || `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`;

		this.client = createClient({
			url: redisUrl,
			password: env.REDIS_PASSWORD || undefined,
		});

		this.client.on("error", (err) => {
			logger.error("Redis client error:", err);
		});

		this.client.on("connect", () => {
			logger.info("Redis client connected");
		});

		this.client.on("ready", () => {
			logger.info("Redis client ready");
		});
	}

	public static getInstance(): RedisService {
		if (!RedisService.instance) {
			RedisService.instance = new RedisService();
		}
		return RedisService.instance;
	}

	public async connect(): Promise<void> {
		if (!this.client.isOpen) {
			await this.client.connect();
		}
	}

	public async disconnect(): Promise<void> {
		if (this.client.isOpen) {
			await this.client.disconnect();
		}
	}

	public async get(key: string): Promise<string | null> {
		try {
			return await this.client.get(key);
		} catch (error) {
			logger.error("Redis get error:", error);
			return null;
		}
	}

	public async set(
		key: string,
		value: string,
		ttlSeconds?: number,
	): Promise<void> {
		try {
			if (ttlSeconds) {
				await this.client.setEx(key, ttlSeconds, value);
			} else {
				await this.client.set(key, value);
			}
		} catch (error) {
			logger.error("Redis set error:", error);
			throw error;
		}
	}

	public async del(key: string): Promise<void> {
		try {
			await this.client.del(key);
		} catch (error) {
			logger.error("Redis del error:", error);
			throw error;
		}
	}

	public async exists(key: string): Promise<boolean> {
		try {
			const result = await this.client.exists(key);
			return result === 1;
		} catch (error) {
			logger.error("Redis exists error:", error);
			return false;
		}
	}

	public async getJson<T>(key: string): Promise<T | null> {
		try {
			const value = await this.get(key);
			return value ? JSON.parse(value) : null;
		} catch (error) {
			logger.error("Redis getJson error:", error);
			return null;
		}
	}

	public async setJson<T>(
		key: string,
		value: T,
		ttlSeconds?: number,
	): Promise<void> {
		try {
			await this.set(key, JSON.stringify(value), ttlSeconds);
		} catch (error) {
			logger.error("Redis setJson error:", error);
			throw error;
		}
	}

	public async flushAll(): Promise<void> {
		try {
			await this.client.flushAll();
		} catch (error) {
			logger.error("Redis flushAll error:", error);
			throw error;
		}
	}

	public async keys(pattern: string): Promise<string[]> {
		try {
			return await this.client.keys(pattern);
		} catch (error) {
			logger.error("Redis keys error:", error);
			return [];
		}
	}

	// Cache invalidation helpers
	public async invalidateUserCache(userId: string): Promise<void> {
		try {
			const keys = await this.keys(`user:${userId}:*`);
			if (keys.length > 0) {
				await this.client.del(keys);
			}
		} catch (error) {
			logger.error("Redis invalidateUserCache error:", error);
		}
	}

	public async invalidateRecommendationCache(userId: string): Promise<void> {
		try {
			const keys = await this.keys(`recommendation:${userId}:*`);
			if (keys.length > 0) {
				await this.client.del(keys);
			}
		} catch (error) {
			logger.error("Redis invalidateRecommendationCache error:", error);
		}
	}

	// Rate limiting helpers
	public async incrementRateLimit(
		key: string,
		windowMs: number,
	): Promise<number> {
		try {
			const count = await this.client.incr(key);
			if (count === 1) {
				await this.client.expire(key, Math.ceil(windowMs / 1000));
			}
			return count;
		} catch (error) {
			logger.error("Redis incrementRateLimit error:", error);
			throw error;
		}
	}

	public async getRateLimit(key: string): Promise<number> {
		try {
			const count = await this.client.get(key);
			return count ? Number.parseInt(count, 10) : 0;
		} catch (error) {
			logger.error("Redis getRateLimit error:", error);
			return 0;
		}
	}
}
