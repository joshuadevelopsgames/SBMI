import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    // No DB configured — return a dummy client that throws on any real query.
    // This allows pages that check demo cookies before touching the DB to work.
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === '$connect' || prop === '$disconnect') return () => Promise.resolve()
        // Return a proxy for model accessors (e.g. prisma.user)
        return new Proxy(
          {},
          {
            get(_t, method) {
              return () =>
                Promise.reject(
                  new Error(
                    `[SBMI] No DATABASE_URL configured. Cannot call prisma.${String(prop)}.${String(method)}()`
                  )
                )
            },
          }
        )
      },
    })
  }

  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? (createPrismaClient() as PrismaClient)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
