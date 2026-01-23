import prisma from '../config/prisma';
import { nanoid } from 'nanoid/async';
import redis from '../config/redis';
import { scrapeMetadata } from '../utils/metadata';


export async function createShortLink(originalUrl: string) {
  const shortCode = await nanoid(8);

  const meta = await scrapeMetadata(originalUrl);

  const link = await prisma.link.create({
    data: {
      originalUrl,
      shortCode,
      title: meta.title,
      description: meta.description,
      favicon: meta.favicon,
    },
  });

  return link;
}


export async function findLinkByCode(code: string) {
  // 1. Check Redis
  const cached = await redis.get(`link:${code}`);

  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Fallback to DB
  const link = await prisma.link.findUnique({
    where: { shortCode: code },
  });

  if (!link) return null;

  // 3. Store in Redis for next time
  await redis.set(`link:${code}`, JSON.stringify(link), {
    EX: 60 * 60, // cache for 1 hour
  });

  return link;
}


export async function incrementClick(id: string) {
  return prisma.link.update({
    where: { id },
    data: { clicks: { increment: 1 } },
  });
}


export async function getAllLinks() {
  return prisma.link.findMany({
    orderBy: {
      createdAt: 'desc',
    },
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


