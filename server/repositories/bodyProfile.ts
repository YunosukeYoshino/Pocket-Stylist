import type { PrismaClient } from '@prisma/client'
import type { BodyProfile } from '@prisma/client'
import type { CreateBodyProfileInput, UpdateBodyProfileInput } from '../schemas/user'
import { BaseRepository } from './base'

export class BodyProfileRepository extends BaseRepository {
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
      // Proper update operation - only updates existing records
      return await this.prisma.bodyProfile.update({
        where: { userId },
        data,
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

  async upsert(
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
      this.handleError(error, 'upsert')
    }
  }
}
