import { title } from 'node:process';
import prisma from '../config/prisma';

export async function getAnalyticsForCode(shortCode: string) {
  const link = await prisma.link.findUnique({
    where: { shortCode },
    include: { analytics: true },
  });

  if (!link) return null;

  const totalClicks = link.analytics.length;

  const dailyClicksMap: Record<string, number> = {};

  link.analytics.forEach((event) => {
    const day = event.timestamp.toISOString().slice(0, 10);
    dailyClicksMap[day] = (dailyClicksMap[day] || 0) + 1;
  });

  const dailyClicks = Object.entries(dailyClicksMap).map(([date, count]) => ({
    date,
    count,
  }));

  const regionMap: Record<string, number> = {};
  link.analytics.forEach((event) => {
    const region = event.region ?? 'UNKNOWN';
    regionMap[region] = (regionMap[region] || 0) + 1;
  });

  const regions = Object.entries(regionMap).map(([region, count]) => ({
    region,
    count,
  }));

  const deviceMap: Record<string, number> = {};
  link.analytics.forEach((event) => {
    const ua = event.userAgent ?? 'UNKNOWN';
    deviceMap[ua] = (deviceMap[ua] || 0) + 1;
  });

  const devices = Object.entries(deviceMap).map(([userAgent, count]) => ({
    userAgent,
    count,
  }));

  return {
    shortCode,
    originalUrl: link.originalUrl,
    title: link.title,
    favicon: link.favicon,
    totalClicks,
    dailyClicks,
    regions,
    devices,
  };
}

export async function recordClickAnalytics(data: {
  linkId: string;
  region: string;
  userAgent: string;
}) {
  return prisma.linkAnalytics.create({
    data: {
      linkId: data.linkId,
      region: data.region,
      userAgent: data.userAgent,
    },
  });
}
