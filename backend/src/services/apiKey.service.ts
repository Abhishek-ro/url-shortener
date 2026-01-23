import prisma from '../config/prisma';
import crypto from 'crypto';

export async function generateApiKey() {
  const key = crypto.randomBytes(32).toString('hex');

  const apiKey = await prisma.apiKey.create({
    data: { key },
  });

  return apiKey.key;
}

export async function validateApiKey(key: string) {
  return prisma.apiKey.findUnique({
    where: { key },
  });
}
