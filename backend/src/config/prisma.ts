import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Test connection on startup
(async () => {
  try {
    await prisma.$executeRawUnsafe('SELECT 1');
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      const url = new URL(dbUrl);
      console.error(
        `DATABASE_URL: ${url.protocol}//${url.username}:***@${url.host}${url.pathname}`,
      );
    } else {
      console.error('DATABASE_URL: not set');
    }
  }
})();

export default prisma;
