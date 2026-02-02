import { PrismaClient } from '@prisma/client';

const DISABLE_DB =
  process.env.DISABLE_DB === 'true' ||
  (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL);

const makeDisabledPrisma = (reason: string) => {
  const err = new Error(reason);

  const noop = async () => {};

  // Generic function proxy: any call will reject with the disabled error
  const fnProxy = new Proxy(() => Promise.reject(err), {
    get: () => fnProxy,
    apply: () => Promise.reject(err),
  }) as any;

  // Property proxy: returns fnProxy for any property access, but provide
  // harmless implementations for $connect/$disconnect/$on
  const proxy = new Proxy(
    {},
    {
      get: (_t, prop: string) => {
        if (prop === '$disconnect' || prop === '$connect') return noop;
        if (prop === '$on') return () => {};
        if (prop === '$executeRaw' || prop === '$executeRawUnsafe')
          return async () => {
            throw err;
          };
        return fnProxy;
      },
    },
  );

  return proxy as unknown as PrismaClient;
};

let prisma: any;

if (DISABLE_DB) {
  const reason =
    'Prisma database access disabled: set DISABLE_DB=false and provide DATABASE_URL to enable.';
  console.warn('⚠️', reason);
  prisma = makeDisabledPrisma(reason);
} else {
  prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['query', 'error', 'warn'],
    // Increase connection pool size for better concurrency
    // Set via DATABASE_URL: postgresql://...?connection_limit=20
  });

  (async () => {
    try {
      await prisma.$executeRawUnsafe('SELECT 1');
      console.log('✅ Database connected successfully');
    } catch (err) {
      console.error('❌ Database connection failed:', err);
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        try {
          const url = new URL(dbUrl);
          console.error(
            `DATABASE_URL: ${url.protocol}//${url.username}:***@${url.host}${url.pathname}`,
          );
        } catch (_) {
          console.error('DATABASE_URL: malformed');
        }
      } else {
        console.error('DATABASE_URL: not set');
      }

      // In development, if DB cannot be reached, switch to disabled proxy so
      // the server can continue in degraded mode instead of crashing.
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          'Running in development: switching Prisma to degraded mode',
        );
        prisma = makeDisabledPrisma(
          'Switched to degraded Prisma after connection failure',
        );
      }
    }
  })();
}

export default prisma;
