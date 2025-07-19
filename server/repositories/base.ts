import type { PrismaClient } from '@prisma/client'

export abstract class BaseRepository {
  protected prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  protected handleError(error: unknown, operation: string): never {
    console.error(`Repository error in ${operation}:`, error)
    throw error
  }
}
