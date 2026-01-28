import prisma from '../config/prisma';
import crypto from 'crypto';

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function generateApiKey() {
  const key = crypto.randomBytes(32).toString('hex');
  const hashedKey = hashKey(key);

  await prisma.apiKey.create({
    data: { key: hashedKey },
  });

  // Return raw key ONCE to user; they must store it (can't be retrieved again)
  return key;
}

export async function validateApiKey(key: string) {
  const hashedKey = hashKey(key);
  return prisma.apiKey.findUnique({
    where: { key: hashedKey },
  });
}
