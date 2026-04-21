import { PrismaClient } from "@prisma/client/index";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * Prisma 7 singleton client initialization.
 * In Prisma 7, we must use a driver adapter (e.g., pg) for Postgres connections.
 */

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    // During local development without .env filled, we return a basic client
    // so it doesn't crash on build/scan.
    return new PrismaClient();
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
