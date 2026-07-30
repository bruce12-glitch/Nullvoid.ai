import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../app/generated/prisma';
import ws from 'ws';

// Setup WebSocket for serverless environment if not in edge runtime
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL?.replace(/^"|"$/g, '');
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as unknown as ConstructorParameters<typeof PrismaNeon>[0]);

  return new PrismaClient({ adapter });
};

const globalForPrisma2 = global as unknown as { prisma: PrismaClient | undefined };

export const db = globalForPrisma2.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma2.prisma = db;
