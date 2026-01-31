import prisma from '../config/prisma';
import { popAnalyticsBatch } from '../utils/queue';
import redis from '../config/redis';

async function startWorker() {
  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (err) {
      setTimeout(startWorker, 5000);
      return;
    }
  }

  while (true) {
    try {
      const batch = await popAnalyticsBatch(100);

      if (batch.length > 0) {
        await prisma.linkAnalytics.createMany({
          data: batch.map((event) => ({
            linkId: event.linkId,
            region: event.region,
            userAgent: event.userAgent,
          })),
        });
      }

      await new Promise((res) => setTimeout(res, 200));
    } catch (err) {
      console.error('❌ Analytics error:', err);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

startWorker();
