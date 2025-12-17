import { prisma } from "./prisma";

/**
 * Probability-based cleanup to avoid excessive deletes.
 * 1% of calls will trigger cleanup.
 */
function shouldCleanup(probability = 0.5): boolean {
	return Math.random() < probability;
}

/**
 * Fire-and-forget cleanup of expired rows.
 * Errors are swallowed intentionally.
 */
async function cleanupExpired(): Promise<void> {
	try {
		await prisma.cache.deleteMany({
			where: {
				expireAt: { lt: new Date() },
			},
		});
	} catch {
		// Never break the main request
	}
}

/**
 * Get cached value.
 * - Never returns expired data
 * - Opportunistically cleans expired rows
 */
export async function getCached(key: string) {
	const row = await prisma.cache.findFirst({
		where: {
			key,
			expireAt: { gt: new Date() }, // DB-level TTL check
		},
		select: {
			data: true,
		},
	});

	if (shouldCleanup()) {
		cleanupExpired();
	}

	return row?.data ?? null;
}

/**
 * Set cached value with TTL (seconds).
 * Uses UPSERT and triggers lazy cleanup.
 */
export async function setCached(
	key: string,
	data: any,
	ttlSeconds: number
) {
	const expireAt = new Date(Date.now() + ttlSeconds * 1000);

	await prisma.cache.upsert({
		where: { key },
		update: {
			data,
			expireAt,
		},
		create: {
			key,
			data,
			expireAt,
		},
	});

	if (shouldCleanup()) {
		cleanupExpired();
	}
}