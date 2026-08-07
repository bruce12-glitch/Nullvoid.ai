import { PrismaClient } from './generated/prisma/client';

let prismaClientSingleton: () => PrismaClient;

try {
  // Lazily require adapter only if DATABASE_URL is present; allows dev preview without DB
  const { PrismaPg } = require('@prisma/adapter-pg');
  prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL?.replace(/^"|"$/g, '');
    if (!connectionString || connectionString.includes('dummy') || connectionString.includes('mock')) {
      console.warn("[db] DATABASE_URL missing or dummy — using in-memory mock PrismaClient");
      return new PrismaClient() as any;
    }
    try {
      const adapter = new PrismaPg({
        connectionString,
        max: 10,
        connectionTimeoutMillis: 20_000,
        idleTimeoutMillis: 30_000,
        query_timeout: 30_000,
        statement_timeout: 30_000,
        ssl: { rejectUnauthorized: false },
      });
      return new PrismaClient({ adapter } as any);
    } catch (e) {
      console.warn("[db] Failed to create PrismaPg adapter, falling back to mock:", e);
      return new PrismaClient() as any;
    }
  };
} catch {
  prismaClientSingleton = () => {
    console.warn("[db] @prisma/adapter-pg not available — using mock PrismaClient");
    return new PrismaClient() as any;
  };
}

const globalForPrisma2 = global as unknown as { prisma: PrismaClient | undefined };

export const db = globalForPrisma2.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma2.prisma = db;
