FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev
WORKDIR /build
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build || npx tsc
RUN npm prune --production

FROM node:20-alpine
RUN apk add --no-cache dumb-init postgresql-client redis
WORKDIR /app
COPY --from=builder /build/package.json ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma
COPY --from=builder /build/ecosystem.config.js ./
COPY --from=builder /build/start.sh ./
RUN sed -i 's/\r$//' start.sh && \
    chmod +x start.sh && \
    npm install -g pm2
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app
USER nodejs
ENV NODE_ENV=production PORT=5000
EXPOSE 5000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./start.sh"]