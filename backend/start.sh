#!/bin/sh

# Startup script for production deployment
# Detects environment and starts appropriately

echo "Starting BoltLink API..."
echo "WEB_CONCURRENCY: $WEB_CONCURRENCY"
echo "RENDER: $RENDER"

# For single-core environments (like Render free tier), use node directly
# For multi-core environments, use PM2 cluster mode
if [ "$WEB_CONCURRENCY" = "1" ]; then
  echo "Single-core environment detected. Starting with Node.js directly..."
  exec node dist/index.js
else
  echo "Multi-core environment detected. Starting with PM2 cluster mode..."
  exec pm2-runtime start ecosystem.config.js --no-daemon
fi
