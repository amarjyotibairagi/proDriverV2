import { PrismaClient } from '../generated/prisma-client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const getPrismaClient = () => {
  const client = globalForPrisma.prisma || new PrismaClient()

  // If the client exists but is missing the Notification model, it's stale
  if (!(client as any).notification && typeof window === 'undefined') {
    console.warn("🔄 Prisma client is stale (missing Notification). Recreating...")
    return new PrismaClient()
  }
  return client
}

export const prisma = getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma