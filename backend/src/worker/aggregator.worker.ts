import prisma from '../config/prisma';
import redis from '../config/redis';

async function aggregateDirtyLinks() {
  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (err) {
      setTimeout(aggregateDirtyLinks, 5000);
      return;
    }
  }

  while (true) {
    try {
      const dirtyLinks = await redis.sMembers('dirty_links');

      if (dirtyLinks.length > 0) {
        for (const linkId of dirtyLinks) {
          const counterKey = `link:counter:${linkId}`;
          const counterVal = await redis.get(counterKey);

          if (counterVal) {
            const increment = parseInt(counterVal, 10);
            if (increment > 0) {
              await prisma.link.update({
                where: { id: linkId },
                data: { clicks: { increment } },
              });
              await redis.del(counterKey);
            }
          }
          await redis.sRem('dirty_links', linkId);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (err) {
      console.error('❌ Aggregator error:', err);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

aggregateDirtyLinks();
