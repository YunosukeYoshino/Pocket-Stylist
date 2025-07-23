import { z } from "zod";

// Specific preference schema for better type safety
const preferencesSchema = z
	.object({
		style: z
			.enum([
				"casual",
				"formal",
				"business",
				"sporty",
				"trendy",
				"classic",
				"bohemian",
				"minimalist",
			])
			.optional(),
		colors: z.array(z.string().max(30)).max(10).optional(),
		brands: z.array(z.string().max(50)).max(20).optional(),
		priceRange: z
			.object({
				min: z.number().min(0).optional(),
				max: z.number().min(0).optional(),
			})
			.optional(),
		sizes: z
			.object({
				top: z.string().max(10).optional(),
				bottom: z.string().max(10).optional(),
				shoes: z.string().max(10).optional(),
				dress: z.string().max(10).optional(),
			})
			.optional(),
		materials: z
			.array(
				z.enum([
					"cotton",
					"wool",
					"silk",
					"polyester",
					"linen",
					"denim",
					"leather",
					"synthetic",
				]),
			)
			.max(10)
			.optional(),
		occasions: z
			.array(
				z.enum([
					"work",
					"casual",
					"formal",
					"party",
					"date",
					"travel",
					"sport",
					"home",
				]),
			)
			.max(10)
			.optional(),
		seasons: z
			.array(z.enum(["spring", "summer", "fall", "winter"]))
			.max(4)
			.optional(),
	})
	.optional();

// User schemas
export const updateUserProfileSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	avatarUrl: z.string().url().optional(),
	gender: z.enum(["male", "female", "other"]).optional(),
	birthDate: z.coerce.date().optional(), // Use coerce.date() to match userResponseSchema
	phone: z.string().max(20).optional(),
	preferences: preferencesSchema,
});

export const userResponseSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	name: z.string().nullable(),
	auth0Id: z.string(),
	avatarUrl: z.string().nullable(),
	gender: z.enum(["male", "female", "other"]).nullable(),
	birthDate: z.date().nullable(),
	phone: z.string().nullable(),
	preferences: preferencesSchema.nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Specific measurements schema for better type safety
const measurementsSchema = z
	.object({
		// Upper body measurements (in cm)
		chest: z.number().min(50).max(200).optional(),
		bust: z.number().min(50).max(200).optional(),
		waist: z.number().min(40).max(150).optional(),
		hips: z.number().min(50).max(200).optional(),
		shoulders: z.number().min(30).max(80).optional(),

		// Arm measurements (in cm)
		armLength: z.number().min(40).max(100).optional(),
		upperArm: z.number().min(15).max(50).optional(),
		forearm: z.number().min(15).max(40).optional(),
		wrist: z.number().min(10).max(25).optional(),

		// Leg measurements (in cm)
		inseam: z.number().min(40).max(120).optional(),
		outseam: z.number().min(60).max(140).optional(),
		thigh: z.number().min(30).max(100).optional(),
		knee: z.number().min(25).max(60).optional(),
		calf: z.number().min(20).max(60).optional(),
		ankle: z.number().min(15).max(35).optional(),

		// Torso measurements (in cm)
		neckCircumference: z.number().min(25).max(50).optional(),
		backWidth: z.number().min(25).max(60).optional(),
		frontLength: z.number().min(30).max(80).optional(),
		backLength: z.number().min(30).max(80).optional(),

		// Foot measurements (in cm)
		footLength: z.number().min(15).max(35).optional(),
		footWidth: z.number().min(6).max(15).optional(),
	})
	.optional();

// Body Profile schemas
const bodyProfileFields = z.object({
	height: z.number().int().min(50).max(300).optional(),
	weight: z.number().int().min(20).max(500).optional(),
	bodyType: z.string().max(50).optional(),
	skinTone: z.string().max(50).optional(),
	measurements: measurementsSchema,
	fitPreferences: z.string().max(100).optional(),
});

export const createBodyProfileSchema = bodyProfileFields;
export const updateBodyProfileSchema = bodyProfileFields;

export const bodyProfileResponseSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	height: z.number().int().nullable(),
	weight: z.number().int().nullable(),
	bodyType: z.string().nullable(),
	skinTone: z.string().nullable(),
	measurements: measurementsSchema.nullable(),
	fitPreferences: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Auth schemas
export const auth0LoginSchema = z.object({
	auth0Id: z.string(),
	email: z.string().email(),
	name: z.string().optional(),
	avatarUrl: z.string().url().optional(),
});

export const refreshTokenSchema = z.object({
	refreshToken: z.string(),
});

export const tokenResponseSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string().optional(),
	user: userResponseSchema.optional(),
});

// Common schemas
export const paginationSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(20),
});

export const apiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
	z.object({
		data: dataSchema,
		message: z.string().optional(),
		timestamp: z.string(),
	});

export const paginatedResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
	z.object({
		data: z.array(dataSchema),
		pagination: z.object({
			page: z.number(),
			limit: z.number(),
			total: z.number(),
			totalPages: z.number(),
		}),
		timestamp: z.string(),
	});

// Type exports
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type CreateBodyProfileInput = z.infer<typeof createBodyProfileSchema>;
export type UpdateBodyProfileInput = z.infer<typeof updateBodyProfileSchema>;
export type BodyProfileResponse = z.infer<typeof bodyProfileResponseSchema>;
export type Auth0LoginInput = z.infer<typeof auth0LoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
