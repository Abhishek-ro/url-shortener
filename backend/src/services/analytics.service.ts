import { title } from 'node:process';
import prisma from '../config/prisma';

export async function getAnalyticsForCode(shortCode: string) {
  const link = await prisma.link.findUnique({
    where: { shortCode },
    include: { analytics: true },
  });

  if (!link) return null;

  const totalClicks = link.analytics.length;

  // Daily clicks aggregation
  const dailyClicksMap: Record<string, number> = {};
  link.analytics.forEach(
    (event: { timestamp: Date; region?: string; userAgent?: string }) => {
      const day = event.timestamp.toISOString().slice(0, 10);
      dailyClicksMap[day] = (dailyClicksMap[day] || 0) + 1;
    },
  );

  const dailyClicks = Object.entries(dailyClicksMap).map(([date, count]) => ({
    date,
    count,
  }));

  // Region analysis
  const regionMap: Record<string, number> = {};
  link.analytics.forEach(
    (event: { timestamp: Date; region?: string; userAgent?: string }) => {
      const region = event.region ?? 'UNKNOWN';
      regionMap[region] = (regionMap[region] || 0) + 1;
    },
  );

  const regions = Object.entries(regionMap)
    .sort((a, b) => b[1] - a[1])
    .map(([region, count]) => ({
      region,
      count,
      percentage: ((count / (totalClicks || 1)) * 100).toFixed(1),
    }));

  const topRegion = regions[0]?.region || 'UNKNOWN';

  // Device/UserAgent analysis
  const deviceMap: Record<string, number> = {};
  link.analytics.forEach(
    (event: { timestamp: Date; region?: string; userAgent?: string }) => {
      const ua = event.userAgent ?? 'UNKNOWN';
      deviceMap[ua] = (deviceMap[ua] || 0) + 1;
    },
  );

  const devices = Object.entries(deviceMap)
    .sort((a, b) => b[1] - a[1])
    .map(([userAgent, count]) => ({
      userAgent,
      count,
    }));

  const topDevice = devices[0]?.userAgent || 'UNKNOWN';

  // Transform daily clicks to match the points format expected by frontend
  const points = dailyClicks.map((dc) => ({
    timestamp: dc.date,
    clicks: dc.count,
    region: topRegion,
  }));

  return {
    summary: {
      totalClicks,
      topRegion,
      topDevice,
      avgLatency: 14, // Could be calculated from more detailed metrics if available
      conversionRate: 0, // Would need more context to calculate properly
    },
    points,
    topRegions: regions,
    shortCode,
    originalUrl: link.originalUrl,
    title: link.title,
    favicon: link.favicon,
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
