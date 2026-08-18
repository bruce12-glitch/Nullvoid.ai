import { PrismaClient } from './generated/prisma/client';

/**
 * Prisma client singleton.
 *
 * Two deliberate behaviours here:
 *
 *  1. In production we FAIL FAST. This module used to silently fall back to a
 *     driver-less `new PrismaClient()` whenever DATABASE_URL was missing,
 *     looked like a placeholder, or the adapter failed to construct. That
 *     "mock" cannot execute queries, so a misconfigured deploy surfaced as
 *     confusing 500s (`prisma.$queryRaw is not a function`) deep inside
 *     request handlers instead of a clear boot error.
 *
 *  2. TLS certificates are verified. The previous `rejectUnauthorized: false`
 *     disabled verification for every database connection, which permits a
 *     man-in-the-middle to read or rewrite all traffic. Providers that use a
 *     private CA should supply it via `sslmode`/`sslrootcert` in the
 *     connection string, or opt in explicitly with DATABASE_SSL_NO_VERIFY.
 */

function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  return url.includes('dummy') || url.includes('mock');
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL?.replace(/^"|"$/g, '');
  const isProduction = process.env.NODE_ENV === 'production';

  if (isPlaceholderUrl(connectionString)) {
    if (isProduction) {
      throw new Error(
        '[db] DATABASE_URL is missing or is a placeholder. Refusing to start ' +
          'with a non-functional database client in production. Set a real ' +
          'DATABASE_URL (see .env.example).'
      );
    }
    console.warn(
      '[db] DATABASE_URL missing or placeholder — using a driver-less ' +
        'PrismaClient. Queries WILL fail; this is for UI-only local preview.'
    );
    return new PrismaClient();
  }

  // Opt-in escape hatch for self-signed certs in local/staging environments.
  // Never silently enabled, and never the default.
  const disableTlsVerify = process.env.DATABASE_SSL_NO_VERIFY === 'true';
  if (disableTlsVerify && isProduction) {
    throw new Error(
      '[db] DATABASE_SSL_NO_VERIFY=true is not permitted in production: it ' +
        'disables TLS certificate verification and exposes the connection to ' +
        'man-in-the-middle attacks.'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require('@prisma/adapter-pg');

  const adapter = new PrismaPg({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 30_000,
    query_timeout: 30_000,
    statement_timeout: 30_000,
    ...(disableTlsVerify ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
