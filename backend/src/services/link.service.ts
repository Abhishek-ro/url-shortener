import prisma from '../config/prisma';
import { nanoid } from 'nanoid/async';
import redis from '../config/redis';
import { scrapeMetadata } from '../utils/metadata';
import bcrypt from 'bcryptjs';

export async function createShortLink(
  originalUrl: string,
  options?: {
    userId?: string | null;
    isProtected?: boolean;
    password?: string | null;
    isExpiring?: boolean;
    expiresAt?: Date | null;
    isRateLimited?: boolean;
    maxClicksPerMin?: number;
  },
) {
  const shortCode = await nanoid(8);

  // Hash password if provided
  let hashedPassword = null;
  if (options?.isProtected && options?.password) {
    hashedPassword = await bcrypt.hash(options.password, 10);
  }

  // Create link immediately without blocking on metadata scrape
  const link = await prisma.link.create({
    data: {
      userId: options?.userId || null,
      originalUrl,
      shortCode,
      title: null,
      description: null,
      favicon: null,
      isProtected: options?.isProtected || false,
      password: hashedPassword,
      isExpiring: options?.isExpiring || false,
      expiresAt: options?.expiresAt || null,
      isRateLimited: options?.isRateLimited || false,
      maxClicksPerMin: options?.maxClicksPerMin || 100,
    },
  });

  // Fetch metadata asynchronously in background (fire-and-forget)
  scrapeMetadata(originalUrl)
    .then((meta) => {
      // Update link with metadata asynchronously
      prisma.link
        .update({
          where: { id: link.id },
          data: {
            title: meta.title,
            description: meta.description,
            favicon: meta.favicon,
          },
        })
        .catch((err) => {
          console.error(
            `Failed to update metadata for link ${link.id}:`,
            err.message,
          );
        });
    })
    .catch((err) => {
      console.error(`Metadata scrape failed for ${originalUrl}:`, err.message);
    });

  return link;
}

export async function findLinkByCode(code: string) {
  const cached = await redis.get(`link:${code}`);

  if (cached) {
    return JSON.parse(cached);
  }

  const link = await prisma.link.findUnique({
    where: { shortCode: code },
  });

  if (!link) return null;

  await redis.set(`link:${code}`, JSON.stringify(link), {
    EX: 60 * 60,
  });

  return link;
}

export async function incrementClick(id: string) {
  // Fast atomic counter in Redis (O(1), non-blocking)
  await redis.incr(`link:counter:${id}`);
  // Mark link as dirty for aggregation (background job will persist)
  await redis.sAdd('dirty_links', id);
  // No DB write here — aggregator job batches these later
  return;
}

export async function getRecentClicks(
  linkId: string,
  secondsBack: number = 60,
): Promise<number> {
  // Use Redis sliding window counter instead of expensive DB count
  // Key: rate:<linkId>:<second> for granular sliding window
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - secondsBack;

  const keys = Array.from(
    { length: secondsBack + 1 },
    (_, i) => `rate:${linkId}:${windowStart + i}`,
  );

  const counts = await Promise.all(keys.map((k) => redis.get(k)));
  const total = counts.reduce(
    (sum, val) => sum + (parseInt(val || '0') || 0),
    0,
  );

  return total;
}

export async function getAllLinks(limit = 100, offset = 0) {
  return prisma.link.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });
}

export async function deleteLink(id: string) {
  await prisma.linkAnalytics.deleteMany({
    where: { linkId: id },
  });

  return prisma.link.delete({
    where: { id },
  });
}

export async function updateLink(
  id: string,
  data: {
    originalUrl?: string;
    title?: string | null;
    description?: string | null;
    favicon?: string | null;
  },
) {
  return prisma.link.update({
    where: { id },
    data,
  });
}

export async function getTopLinks(limit = 10) {
  return prisma.link.findMany({
    orderBy: { clicks: 'desc' },
    take: limit,
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      clicks: true,
      title: true,
      description: true,
      favicon: true,
      createdAt: true,
    },
  });
}
