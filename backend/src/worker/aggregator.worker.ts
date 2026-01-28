import prisma from '../config/prisma';
import redis from '../config/redis';

console.log('📊 Aggregator Worker Started - Persisting click counters to DB');

async function aggregateDirtyLinks() {
  while (true) {
    try {
      // Get all dirty links (those with pending counter updates)
      const dirtyLinks = await redis.sMembers('dirty_links');

      if (dirtyLinks.length > 0) {
        console.log(`Aggregating ${dirtyLinks.length} links...`);

        // Process each link: read counter from Redis and update DB
        for (const linkId of dirtyLinks) {
          const counterKey = `link:counter:${linkId}`;
          const counterVal = await redis.get(counterKey);

          if (counterVal) {
            const increment = parseInt(counterVal, 10);
            if (increment > 0) {
              // Atomic increment in DB; then reset Redis counter
              await prisma.link.update({
                where: { id: linkId },
                data: { clicks: { increment } },
              });

              // Reset Redis counter
              await redis.del(counterKey);
            }
          }

          // Remove from dirty set
          await redis.sRem('dirty_links', linkId);
        }

        console.log(`✅ Aggregated ${dirtyLinks.length} links`);
      }

      // Sleep before next batch
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (err) {
      console.error('❌ Aggregator error:', err);
      // Continue on error; don't crash
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

aggregateDirtyLinks();
