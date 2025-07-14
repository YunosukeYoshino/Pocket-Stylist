import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

let prisma: PrismaClient | null = null

export function getPrismaClient(databaseUrl: string): PrismaClient {
  if (!prisma) {
    const pool = new Pool({
      connectionString: databaseUrl,
    })
    
    const adapter = new PrismaPg(pool)
    
    prisma = new PrismaClient({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    })
  }
  
  return prisma
}

export const prismaClient = prisma