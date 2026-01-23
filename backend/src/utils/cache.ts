import redis from '../config/redis';

export async function getCachedLink(code: string) {
  const data = await redis.get(`link:${code}`);
  return data ? JSON.parse(data) : null;
}

export async function setCachedLink(code: string, value: any) {
  await redis.set(`link:${code}`, JSON.stringify(value), {
    EX: 60 * 60, // 1 hour
  });
}

export async function deleteCachedLink(code: string) {
  await redis.del(`link:${code}`);
}
