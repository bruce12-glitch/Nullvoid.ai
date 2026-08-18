import { PrismaClient } from './generated/prisma/client';

/**
 * When DATABASE_URL is absent (e.g. CI builds without secrets), return a lazy
 * proxy instead of constructing PrismaClient — Prisma 7 throws at construction
 * time without a datasource/adapter, which would crash `next build` during
 * page-data collection. The proxy only errors if a query is actually executed.
 */
function makeUnconfiguredDbProxy(): PrismaClient {
  const reject = () => Promise.reject(new Error("[db] DATABASE_URL is not configured"));
  return new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (prop === "then" || prop === Symbol.toPrimitive || prop === Symbol.toStringTag) return undefined;
      if (prop === "$connect" || prop === "$disconnect") return async () => {};
      // Model delegates ($queryRaw, project.findMany, ...) — callable and
      // property-accessible, always rejecting at call time.
      return new Proxy(function () {}, {
        apply: () => reject(),
        get: () => () => reject(),
      });
    },
  });
}

let prismaClientSingleton: () => PrismaClient;

try {
  // Lazily require adapter only if DATABASE_URL is present; allows dev preview without DB
  const { PrismaPg } = require('@prisma/adapter-pg');
  prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL?.replace(/^"|"$/g, '');
    if (!connectionString || connectionString.includes('dummy') || connectionString.includes('mock')) {
      console.warn("[db] DATABASE_URL missing or dummy — using lazy unconfigured DB proxy");
      return makeUnconfiguredDbProxy();
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
      console.warn("[db] Failed to create PrismaPg adapter, falling back to lazy proxy:", e);
      return makeUnconfiguredDbProxy();
    }
  };
} catch {
  prismaClientSingleton = () => {
    console.warn("[db] @prisma/adapter-pg not available — using lazy unconfigured DB proxy");
    return makeUnconfiguredDbProxy();
  };
}

const globalForPrisma2 = global as unknown as { prisma: PrismaClient | undefined };

export const db = globalForPrisma2.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma2.prisma = db;
