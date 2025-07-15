import type { PrismaClient } from '@prisma/client'
import { UserService } from '../user'
import { ApiError } from '../../middleware/errorHandler'

describe('UserService', () => {
  let userService: UserService
  let mockPrisma: jest.Mocked<PrismaClient>

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as any

    userService = new UserService(mockPrisma)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserProfile', () => {
    it('should return user profile when user exists', async () => {
      const auth0Id = 'auth0|123'
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        gender: 'male',
        birthDate: new Date('1990-01-01'),
        phone: '+1234567890',
        preferences: { style: 'casual' },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(userService['userRepository'], 'findByAuth0Id').mockResolvedValue(mockUser as any)

      const result = await userService.getUserProfile(auth0Id)

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatarUrl: mockUser.avatarUrl,
        gender: mockUser.gender,
        birthDate: mockUser.birthDate,
        phone: mockUser.phone,
        preferences: mockUser.preferences,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      })
    })

    it('should throw ApiError when user not found', async () => {
      const auth0Id = 'auth0|123'

      jest.spyOn(userService['userRepository'], 'findByAuth0Id').mockResolvedValue(null)

      await expect(userService.getUserProfile(auth0Id)).rejects.toThrow(ApiError)
      await expect(userService.getUserProfile(auth0Id)).rejects.toThrow('User not found')
    })
  })

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const auth0Id = 'auth0|123'
      const updateData = {
        name: 'Updated Name',
        phone: '+9876543210',
      }

      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        auth0Id,
      }

      const updatedUser = {
        ...existingUser,
        ...updateData,
        updatedAt: new Date(),
      }

      jest.spyOn(userService['userRepository'], 'findByAuth0Id').mockResolvedValue(existingUser as any)
      jest.spyOn(userService['userRepository'], 'update').mockResolvedValue(updatedUser as any)

      const result = await userService.updateUserProfile(auth0Id, updateData)

      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
        gender: updatedUser.gender,
        birthDate: updatedUser.birthDate,
        phone: updatedUser.phone,
        preferences: updatedUser.preferences,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      })
    })

    it('should throw ApiError when user not found for update', async () => {
      const auth0Id = 'auth0|123'
      const updateData = { name: 'Updated Name' }

      jest.spyOn(userService['userRepository'], 'findByAuth0Id').mockResolvedValue(null)

      await expect(userService.updateUserProfile(auth0Id, updateData)).rejects.toThrow(ApiError)
      await expect(userService.updateUserProfile(auth0Id, updateData)).rejects.toThrow('User not found')
    })
  })

  describe('deleteUserProfile', () => {
    it('should delete user profile successfully', async () => {
      const auth0Id = 'auth0|123'
      const existingUser = {
        id: 'user-id',
        email: 'test@example.com',
        auth0Id,
      }

      jest.spyOn(userService['userRepository'], 'findByAuth0Id').mockResolvedValue(existingUser as any)
      jest.spyOn(userService['userRepository'], 'delete').mockResolvedValue(undefined)

      const result = await userService.deleteUserProfile(auth0Id)

      expect(result).toEqual({
        message: 'User profile deleted successfully',
      })
      expect(userService['userRepository'].delete).toHaveBeenCalledWith(existingUser.id)
    })

    it('should throw ApiError when user not found for deletion', async () => {
      const auth0Id = 'auth0|123'

      jest.spyOn(userService['userRepository'], 'findByAuth0Id').mockResolvedValue(null)

      await expect(userService.deleteUserProfile(auth0Id)).rejects.toThrow(ApiError)
      await expect(userService.deleteUserProfile(auth0Id)).rejects.toThrow('User not found')
    })
  })

  describe('findOrCreateUser', () => {
    it('should return existing user when found by auth0Id', async () => {
      const userData = {
        email: 'test@example.com',
        auth0Id: 'auth0|123',
        name: 'Test User',
      }

      const existingUser = {
        id: 'user-id',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(userService['userRepository'], 'findByAuth0Id').mockResolvedValue(existingUser as any)

      const result = await userService.findOrCreateUser(userData)

      expect(result).toEqual(existingUser)
      expect(userService['userRepository'].findByAuth0Id).toHaveBeenCalledWith(userData.auth0Id)
    })

    it('should return existing user when found by email', async () => {
      const userData = {
        email: 'test@example.com',
        auth0Id: 'auth0|123',
        name: 'Test User',
      }

      const existingUser = {
        id: 'user-id',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(userService['userRepository'], 'findByAuth0Id').mockResolvedValue(null)
      jest.spyOn(userService['userRepository'], 'findByEmail').mockResolvedValue(existingUser as any)

      const result = await userService.findOrCreateUser(userData)

      expect(result).toEqual(existingUser)
      expect(userService['userRepository'].findByAuth0Id).toHaveBeenCalledWith(userData.auth0Id)
      expect(userService['userRepository'].findByEmail).toHaveBeenCalledWith(userData.email)
    })

    it('should create new user when not found', async () => {
      const userData = {
        email: 'test@example.com',
        auth0Id: 'auth0|123',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const newUser = {
        id: 'new-user-id',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(userService['userRepository'], 'findByAuth0Id').mockResolvedValue(null)
      jest.spyOn(userService['userRepository'], 'findByEmail').mockResolvedValue(null)
      jest.spyOn(userService['userRepository'], 'create').mockResolvedValue(newUser as any)

      const result = await userService.findOrCreateUser(userData)

      expect(result).toEqual(newUser)
      expect(userService['userRepository'].create).toHaveBeenCalledWith({
        email: userData.email,
        auth0Id: userData.auth0Id,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
      })
    })

    it('should update existing user with new auth0Id when found by email only', async () => {
      const userData = {
        email: 'test@example.com',
        auth0Id: 'auth0|new-id',
        name: 'Test User',
      }

      const existingUser = {
        id: 'user-id',
        email: userData.email,
        auth0Id: 'auth0|old-id',
        name: 'Old Name',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedUser = {
        ...existingUser,
        auth0Id: userData.auth0Id,
        name: userData.name,
        updatedAt: new Date(),
      }

      jest.spyOn(userService['userRepository'], 'findByAuth0Id').mockResolvedValue(null)
      jest.spyOn(userService['userRepository'], 'findByEmail').mockResolvedValue(existingUser as any)
      jest.spyOn(userService['userRepository'], 'update').mockResolvedValue(updatedUser as any)

      const result = await userService.findOrCreateUser(userData)

      expect(result).toEqual(updatedUser)
      expect(userService['userRepository'].update).toHaveBeenCalledWith(existingUser.id, {
        auth0Id: userData.auth0Id,
        name: userData.name,
      })
    })
  })
})