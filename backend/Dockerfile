# Multi-stage Dockerfile for BoltLink Backend
# Stage 1: Build dependencies and compile TypeScript
# Stage 2: Runtime with minimal image size

# ========== STAGE 1: BUILDER ==========
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /build


COPY package.json package-lock.json ./

# Install dependencies (includes devDependencies)
RUN npm ci --omit=dev && \
    npm ci  # Also install devDependencies for building

# Copy source code
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
COPY ecosystem.config.js ./

# Generate Prisma Client
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN npm run build || npx tsc

# ========== STAGE 2: RUNTIME ==========
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache dumb-init postgresql-client redis

WORKDIR /app

# Copy package files from builder
COPY --from=builder /build/package.json ./
COPY --from=builder /build/package-lock.json ./
COPY --from=builder /build/ecosystem.config.js ./

# Install production dependencies (including PM2)
RUN npm ci --omit=dev && \
    npm install -g pm2 && \
    npm cache clean --force

# Copy compiled app from builder
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma
COPY --from=builder /build/node_modules/.prisma ./node_modules/.prisma

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app/logs

USER nodejs

# Health check - checks the /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Environment variables
ENV NODE_ENV=production \
    PORT=5000 \
    LOG_LEVEL=info

# Expose port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

# Start with PM2 cluster mode (all CPU cores)
# For single-core deployment, use: CMD ["node", "dist/index.js"]
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--no-daemon"]
