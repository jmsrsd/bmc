// Mock @prisma/client for Vitest environment
// This prevents "Failed to resolve import" during import analysis

export class PrismaClient {
  building = {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
  }
  zone = { findMany: () => Promise.resolve([]) }
  sensor = { findMany: () => Promise.resolve([]) }
  alarm = { findMany: () => Promise.resolve([]) }
  auditLog = { create: () => Promise.resolve({}) }
  $queryRaw = () => Promise.resolve([])
  $transaction = (fn: () => any) => fn()
}