import type { PrismaClient } from '@prisma/client'
import { ApiError } from '../../middleware/errorHandler'
import { BodyProfileService } from '../bodyProfile'

describe('BodyProfileService', () => {
  let bodyProfileService: BodyProfileService
  let mockPrisma: jest.Mocked<PrismaClient>

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
      bodyProfile: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
    } as never

    bodyProfileService = new BodyProfileService(mockPrisma)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getBodyProfile', () => {
    it('should return body profile when found', async () => {
      const auth0Id = 'auth0|123'
      const userId = 'user-id'

      const mockUser = { id: userId }
      const mockBodyProfile = {
        id: 'profile-id',
        userId,
        height: 175,
        weight: 70,
        bodyType: 'athletic',
        skinTone: 'medium',
        measurements: { chest: 95 },
        fitPreferences: 'slim',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(bodyProfileService.userRepository, 'findByAuth0Id')
        .mockResolvedValue(mockUser as never)
      jest.spyOn(bodyProfileService.bodyProfileRepository, 'findByUserId').mockResolvedValue({
        ...mockBodyProfile,
        measurements: { chest: 95 },
        fitPreferences: 'slim',
      } as never)

      const result = await bodyProfileService.getBodyProfile(auth0Id)

      expect(result).toEqual({
        id: mockBodyProfile.id,
        userId: mockBodyProfile.userId,
        height: mockBodyProfile.height,
        weight: mockBodyProfile.weight,
        bodyType: mockBodyProfile.bodyType,
        skinTone: mockBodyProfile.skinTone,
        measurements: mockBodyProfile.measurements,
        fitPreferences: mockBodyProfile.fitPreferences,
        createdAt: mockBodyProfile.createdAt,
        updatedAt: mockBodyProfile.updatedAt,
      })
    })

    it('should throw ApiError when user not found', async () => {
      const auth0Id = 'auth0|123'

      jest.spyOn(bodyProfileService.userRepository, 'findByAuth0Id').mockResolvedValue(null)

      await expect(bodyProfileService.getBodyProfile(auth0Id)).rejects.toThrow(ApiError)
      await expect(bodyProfileService.getBodyProfile(auth0Id)).rejects.toThrow('User not found')
    })

    it('should throw ApiError when body profile not found', async () => {
      const auth0Id = 'auth0|123'
      const userId = 'user-id'

      const mockUser = { id: userId }

      jest
        .spyOn(bodyProfileService.userRepository, 'findByAuth0Id')
        .mockResolvedValue(mockUser as never)
      jest.spyOn(bodyProfileService.bodyProfileRepository, 'findByUserId').mockResolvedValue(null)

      await expect(bodyProfileService.getBodyProfile(auth0Id)).rejects.toThrow(ApiError)
      await expect(bodyProfileService.getBodyProfile(auth0Id)).rejects.toThrow(
        'Body profile not found'
      )
    })
  })

  describe('createBodyProfile', () => {
    it('should create body profile successfully', async () => {
      const auth0Id = 'auth0|123'
      const userId = 'user-id'
      const profileData = {
        height: 175,
        weight: 70,
        bodyType: 'athletic',
        skinTone: 'medium',
      }

      const mockUser = { id: userId }
      const mockBodyProfile = {
        id: 'profile-id',
        userId,
        height: profileData.height,
        weight: profileData.weight,
        bodyType: profileData.bodyType,
        skinTone: profileData.skinTone,
        measurements: { chest: 95 },
        fitPreferences: 'slim',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(bodyProfileService.userRepository, 'findByAuth0Id')
        .mockResolvedValue(mockUser as never)
      jest
        .spyOn(bodyProfileService.bodyProfileRepository, 'create')
        .mockResolvedValue(mockBodyProfile as never)

      const result = await bodyProfileService.createBodyProfile(auth0Id, profileData)

      expect(result).toEqual({
        id: mockBodyProfile.id,
        userId: mockBodyProfile.userId,
        height: mockBodyProfile.height,
        weight: mockBodyProfile.weight,
        bodyType: mockBodyProfile.bodyType,
        skinTone: mockBodyProfile.skinTone,
        measurements: mockBodyProfile.measurements,
        fitPreferences: mockBodyProfile.fitPreferences,
        createdAt: mockBodyProfile.createdAt,
        updatedAt: mockBodyProfile.updatedAt,
      })
      expect(bodyProfileService.bodyProfileRepository.create).toHaveBeenCalledWith(
        userId,
        profileData
      )
    })

    it('should throw ApiError when user not found', async () => {
      const auth0Id = 'auth0|123'
      const profileData = { height: 175 }

      jest.spyOn(bodyProfileService.userRepository, 'findByAuth0Id').mockResolvedValue(null)

      await expect(bodyProfileService.createBodyProfile(auth0Id, profileData)).rejects.toThrow(
        ApiError
      )
      await expect(bodyProfileService.createBodyProfile(auth0Id, profileData)).rejects.toThrow(
        'User not found'
      )
    })
  })

  describe('updateBodyProfile', () => {
    it('should update body profile successfully', async () => {
      const auth0Id = 'auth0|123'
      const userId = 'user-id'
      const updateData = {
        height: 180,
        weight: 75,
      }

      const mockUser = { id: userId }
      const updatedBodyProfile = {
        id: 'profile-id',
        userId,
        ...updateData,
        bodyType: 'athletic',
        skinTone: 'medium',
        measurements: { chest: 100 },
        fitPreferences: 'regular',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(bodyProfileService.userRepository, 'findByAuth0Id')
        .mockResolvedValue(mockUser as never)
      jest
        .spyOn(bodyProfileService.bodyProfileRepository, 'upsert')
        .mockResolvedValue(updatedBodyProfile as never)

      const result = await bodyProfileService.updateBodyProfile(auth0Id, updateData)

      expect(result).toEqual({
        id: updatedBodyProfile.id,
        userId: updatedBodyProfile.userId,
        height: updatedBodyProfile.height,
        weight: updatedBodyProfile.weight,
        bodyType: updatedBodyProfile.bodyType,
        skinTone: updatedBodyProfile.skinTone,
        measurements: updatedBodyProfile.measurements,
        fitPreferences: updatedBodyProfile.fitPreferences,
        createdAt: updatedBodyProfile.createdAt,
        updatedAt: updatedBodyProfile.updatedAt,
      })
      expect(bodyProfileService.bodyProfileRepository.upsert).toHaveBeenCalledWith(
        userId,
        updateData
      )
    })

    it('should throw ApiError when user not found', async () => {
      const auth0Id = 'auth0|123'
      const updateData = { height: 180 }

      jest.spyOn(bodyProfileService.userRepository, 'findByAuth0Id').mockResolvedValue(null)

      await expect(bodyProfileService.updateBodyProfile(auth0Id, updateData)).rejects.toThrow(
        ApiError
      )
      await expect(bodyProfileService.updateBodyProfile(auth0Id, updateData)).rejects.toThrow(
        'User not found'
      )
    })
  })

  describe('deleteBodyProfile', () => {
    it('should delete body profile successfully', async () => {
      const auth0Id = 'auth0|123'
      const userId = 'user-id'

      const mockUser = { id: userId }
      const existingProfile = {
        id: 'profile-id',
        userId,
        height: 175,
        weight: 70,
        bodyType: 'athletic',
        skinTone: 'medium',
        measurements: { chest: 95 },
        fitPreferences: 'slim',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest
        .spyOn(bodyProfileService.userRepository, 'findByAuth0Id')
        .mockResolvedValue(mockUser as never)
      jest
        .spyOn(bodyProfileService.bodyProfileRepository, 'findByUserId')
        .mockResolvedValue(existingProfile as never)
      jest
        .spyOn(bodyProfileService.bodyProfileRepository, 'delete')
        .mockResolvedValue(existingProfile as never)

      const result = await bodyProfileService.deleteBodyProfile(auth0Id)

      expect(result).toEqual({
        message: 'Body profile deleted successfully',
      })
      expect(bodyProfileService.bodyProfileRepository.delete).toHaveBeenCalledWith(userId)
    })

    it('should throw ApiError when user not found', async () => {
      const auth0Id = 'auth0|123'

      jest.spyOn(bodyProfileService.userRepository, 'findByAuth0Id').mockResolvedValue(null)

      await expect(bodyProfileService.deleteBodyProfile(auth0Id)).rejects.toThrow(ApiError)
      await expect(bodyProfileService.deleteBodyProfile(auth0Id)).rejects.toThrow('User not found')
    })
  })
})
