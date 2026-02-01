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
    console.error(
      'DATABASE_URL:',
      process.env.DATABASE_URL?.split('@')[1] || 'not set',
    );
  }
})();

export default prisma;
