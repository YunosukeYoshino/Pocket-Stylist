import type { PrismaClient } from '@prisma/client'
import { ApiError } from '../middleware/errorHandler'
import { BodyProfileRepository } from '../repositories/bodyProfile'
import { UserRepository } from '../repositories/user'
import type { CreateBodyProfileInput, UpdateBodyProfileInput } from '../schemas/user'

export class BodyProfileService {
  private bodyProfileRepository: BodyProfileRepository
  private userRepository: UserRepository

  constructor(prisma: PrismaClient) {
    this.bodyProfileRepository = new BodyProfileRepository(prisma)
    this.userRepository = new UserRepository(prisma)
  }

  private formatBodyProfileResponse(bodyProfile: any) {
    return {
      id: bodyProfile.id,
      userId: bodyProfile.userId,
      height: bodyProfile.height,
      weight: bodyProfile.weight,
      bodyType: bodyProfile.bodyType,
      skinTone: bodyProfile.skinTone,
      measurements: bodyProfile.measurements,
      fitPreferences: bodyProfile.fitPreferences,
      createdAt: bodyProfile.createdAt,
      updatedAt: bodyProfile.updatedAt,
    }
  }

  async getBodyProfile(auth0Id: string) {
    // まずユーザーを取得
    const user = await this.userRepository.findByAuth0Id(auth0Id)
    if (!user) {
      throw new ApiError('User not found', 404)
    }

    // ボディプロファイルを取得
    const bodyProfile = await this.bodyProfileRepository.findByUserId(user.id)

    if (!bodyProfile) {
      throw new ApiError('Body profile not found', 404)
    }

    return this.formatBodyProfileResponse(bodyProfile)
  }

  async createBodyProfile(auth0Id: string, data: CreateBodyProfileInput) {
    // まずユーザーを取得
    const user = await this.userRepository.findByAuth0Id(auth0Id)
    if (!user) {
      throw new ApiError('User not found', 404)
    }

    // 既存のボディプロファイルがあるかチェック
    const existingProfile = await this.bodyProfileRepository.findByUserId(user.id)
    if (existingProfile) {
      throw new ApiError('Body profile already exists', 409)
    }

    // 新しいボディプロファイルを作成
    const bodyProfile = await this.bodyProfileRepository.create(user.id, data)

    return this.formatBodyProfileResponse(bodyProfile)
  }

  async updateBodyProfile(auth0Id: string, data: UpdateBodyProfileInput) {
    // まずユーザーを取得
    const user = await this.userRepository.findByAuth0Id(auth0Id)
    if (!user) {
      throw new ApiError('User not found', 404)
    }

    // ボディプロファイルを更新（存在しない場合は作成）
    const bodyProfile = await this.bodyProfileRepository.update(user.id, data)

    return this.formatBodyProfileResponse(bodyProfile)
  }

  async deleteBodyProfile(auth0Id: string) {
    // まずユーザーを取得
    const user = await this.userRepository.findByAuth0Id(auth0Id)
    if (!user) {
      throw new ApiError('User not found', 404)
    }

    // ボディプロファイルを削除
    await this.bodyProfileRepository.delete(user.id)

    return {
      message: 'Body profile deleted successfully',
    }
  }
}
