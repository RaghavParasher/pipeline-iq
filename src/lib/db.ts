import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Creates a PrismaClient with the PrismaPg driver adapter.
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_yIRw8WAVZp6e@ep-red-field-atpa7xn1.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. "
    );
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * Lazily-initialized Prisma client.
 * The Proxy defers the DATABASE_URL check to the first actual DB call,
 * so importing this module at build time does NOT throw.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    // Return the real client property on first access
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    const client = globalForPrisma.prisma;
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
