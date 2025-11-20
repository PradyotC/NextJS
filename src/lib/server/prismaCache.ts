// src/lib/prismaCache.ts
import { prisma } from "./prisma";

export async function getCached(key: string) {
  const row = await prisma.cache.findUnique({ where: { key } });
  if (!row) return null;
  // expireAt is a Date
  if (row.expireAt.getTime() <= Date.now()) return null;
  return row.data;
}

export async function setCached(key: string, data: any, ttlSeconds: number) {
  const expireAt = new Date(Date.now() + ttlSeconds * 1000);
  await prisma.cache.upsert({
    where: { key },
    update: { data, expireAt, createdAt: new Date() },
    create: { key, data, expireAt },
  });
}