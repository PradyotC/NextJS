// src/lib/prisma.ts
import { PrismaClient } from "../../../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({ connectionString });

declare global {
  // Use 'globalThis' for broader compatibility if needed, but 'global' is fine in Node.js runtime
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter, // <-- Pass the adapter instance here
    // optional: log: ["query"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;