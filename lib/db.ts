import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL?.replace(/^"|"$/g, '');
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaPg({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 30_000,
    query_timeout: 30_000,
    statement_timeout: 30_000,
    ssl: { rejectUnauthorized: false },
  });

  return new PrismaClient({ adapter });
};

const globalForPrisma2 = global as unknown as { prisma: PrismaClient | undefined };

export const db = globalForPrisma2.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma2.prisma = db;
