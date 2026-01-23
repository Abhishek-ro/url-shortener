import redis from '../config/redis';

const ANALYTICS_QUEUE = 'analytics_queue';

export async function pushAnalytics(event: {
  linkId: string;
  region: string;
  userAgent: string | null;
}) {
  await redis.lPush(ANALYTICS_QUEUE, JSON.stringify(event));
}

export async function popAnalyticsBatch(batchSize = 100) {
  const events: any[] = [];

  for (let i = 0; i < batchSize; i++) {
    const item = await redis.rPop(ANALYTICS_QUEUE);
    if (!item) break;
    events.push(JSON.parse(item));
  }

  return events;
}
