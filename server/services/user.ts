import type { PrismaClient } from '@prisma/client'
import { ApiError } from '../middleware/errorHandler'
import { UserRepository } from '../repositories/user'
import type { UpdateUserProfileInput } from '../schemas/user'

export class UserService {
  public userRepository: UserRepository

  constructor(prisma: PrismaClient) {
    this.userRepository = new UserRepository(prisma)
  }

  private formatUserProfile(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      gender: user.gender,
      birthDate: user.birthDate,
      phone: user.phone,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async getUserProfile(auth0Id: string) {
    const user = await this.userRepository.findByAuth0Id(auth0Id)

    if (!user) {
      throw new ApiError('User not found', 404)
    }

    return this.formatUserProfile(user)
  }

  async updateUserProfile(auth0Id: string, data: UpdateUserProfileInput) {
    const user = await this.userRepository.findByAuth0Id(auth0Id)

    if (!user) {
      throw new ApiError('User not found', 404)
    }

    const updatedUser = await this.userRepository.update(user.id, data)

    return this.formatUserProfile(updatedUser)
  }

  async deleteUserProfile(auth0Id: string) {
    const user = await this.userRepository.findByAuth0Id(auth0Id)

    if (!user) {
      throw new ApiError('User not found', 404)
    }

    await this.userRepository.delete(user.id)

    return {
      message: 'User profile deleted successfully',
    }
  }

  async findOrCreateUser(userData: {
    email: string
    auth0Id: string
    name?: string
    avatarUrl?: string
  }) {
    return await this.userRepository.findOrCreate(userData)
  }
}
