import { z } from 'zod'

// User schemas
export const updateUserProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  birthDate: z.coerce.date().optional(), // Use coerce.date() to match userResponseSchema
  phone: z.string().max(20).optional(),
  preferences: z.record(z.any()).optional(), // TODO: Define more specific preferences schema
})

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  auth0Id: z.string(),
  avatarUrl: z.string().nullable(),
  gender: z.enum(['male', 'female', 'other']).nullable(),
  birthDate: z.date().nullable(),
  phone: z.string().nullable(),
  preferences: z.record(z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Body Profile schemas
const bodyProfileFields = z.object({
  height: z.number().int().min(50).max(300).optional(),
  weight: z.number().int().min(20).max(500).optional(),
  bodyType: z.string().max(50).optional(),
  skinTone: z.string().max(50).optional(),
  measurements: z.record(z.any()).optional(), // TODO: Define more specific measurement schema
  fitPreferences: z.string().max(100).optional(),
})

export const createBodyProfileSchema = bodyProfileFields
export const updateBodyProfileSchema = bodyProfileFields

export const bodyProfileResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  height: z.number().int().nullable(),
  weight: z.number().int().nullable(),
  bodyType: z.string().nullable(),
  skinTone: z.string().nullable(),
  measurements: z.record(z.any()).nullable(),
  fitPreferences: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Auth schemas
// TODO: This schema doesn't match the current Auth0-based login API
// Consider updating to match the actual API format or creating a separate schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Schema that matches the current Auth0 login implementation
export const auth0LoginSchema = z.object({
  auth0Id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  user: userResponseSchema.optional(),
})

// Common schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const apiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
    timestamp: z.string(),
  })

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
  })

// Type exports
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
export type CreateBodyProfileInput = z.infer<typeof createBodyProfileSchema>
export type UpdateBodyProfileInput = z.infer<typeof updateBodyProfileSchema>
export type BodyProfileResponse = z.infer<typeof bodyProfileResponseSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type Auth0LoginInput = z.infer<typeof auth0LoginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type TokenResponse = z.infer<typeof tokenResponseSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
