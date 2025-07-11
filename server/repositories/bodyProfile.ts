import type { BodyProfile, PrismaClient } from '@prisma/client'
import type { CreateBodyProfileInput, UpdateBodyProfileInput } from '../schemas/user'
import { BaseRepository } from './base'

export class BodyProfileRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma)
  }

  async findByUserId(userId: string): Promise<BodyProfile | null> {
    try {
      return await this.prisma.bodyProfile.findUnique({
        where: { userId },
      })
    } catch (error) {
      this.handleError(error, 'findByUserId')
    }
  }

  async findById(id: string): Promise<BodyProfile | null> {
    try {
      return await this.prisma.bodyProfile.findUnique({
        where: { id },
      })
    } catch (error) {
      this.handleError(error, 'findById')
    }
  }

  async create(userId: string, data: CreateBodyProfileInput): Promise<BodyProfile> {
    try {
      return await this.prisma.bodyProfile.create({
        data: {
          userId,
          ...data,
        },
      })
    } catch (error) {
      this.handleError(error, 'create')
    }
  }

  async update(userId: string, data: UpdateBodyProfileInput): Promise<BodyProfile> {
    try {
      // upsert を使用して、存在しない場合は作成、存在する場合は更新
      return await this.prisma.bodyProfile.upsert({
        where: { userId },
        create: {
          userId,
          ...data,
        },
        update: data,
      })
    } catch (error) {
      this.handleError(error, 'update')
    }
  }

  async delete(userId: string): Promise<BodyProfile> {
    try {
      return await this.prisma.bodyProfile.delete({
        where: { userId },
      })
    } catch (error) {
      this.handleError(error, 'delete')
    }
  }

  async createOrUpdate(
    userId: string,
    data: CreateBodyProfileInput | UpdateBodyProfileInput
  ): Promise<BodyProfile> {
    try {
      return await this.prisma.bodyProfile.upsert({
        where: { userId },
        create: {
          userId,
          ...data,
        },
        update: data,
      })
    } catch (error) {
      this.handleError(error, 'createOrUpdate')
    }
  }
}
