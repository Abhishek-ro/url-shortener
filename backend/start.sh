#!/bin/sh
echo "🚀 Starting BoltLink Services..."
# We use pm2-runtime to manage the API and Workers defined in ecosystem.config.js
exec pm2-runtime start ecosystem.config.js --env production