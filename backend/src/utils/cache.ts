import redis from '../config/redis';

export async function getCachedLink(code: string) {
  try {
    const data = await redis.get(`link:${code}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    // Redis unavailable, return null to fall back to database
    return null;
  }
}

export async function setCachedLink(code: string, value: any) {
  try {
    await redis.set(`link:${code}`, JSON.stringify(value), {
      EX: 60 * 60,
    });
  } catch (err) {
    // Redis unavailable, silently skip caching
  }
}

export async function deleteCachedLink(code: string) {
  try {
    await redis.del(`link:${code}`);
  } catch (err) {
    // Redis unavailable, silently skip
  }
}
