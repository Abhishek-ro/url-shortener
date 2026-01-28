import prisma from '../config/prisma';
import { popAnalyticsBatch } from '../utils/queue';

console.log('📊 Analytics Worker Started!');

async function startWorker() {
  while (true) {
    const batch = await popAnalyticsBatch(100);

    if (batch.length > 0) {
      console.log(`Processing batch: ${batch.length}`);

      await prisma.linkAnalytics.createMany({
        data: batch.map((event) => ({
          linkId: event.linkId,
          region: event.region,
          userAgent: event.userAgent,
        })),
      });
    }

    await new Promise((res) => setTimeout(res, 200));
  }
}

startWorker();
