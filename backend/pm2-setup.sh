#!/bin/bash

# BoltLink PM2 Cluster Setup Script
# Prepares PM2 cluster mode for production multi-core scaling

set -e

echo "🚀 Setting up PM2 Cluster Mode for BoltLink Backend..."

# Create logs directory
mkdir -p logs
echo "📁 Created logs directory"

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Install PM2 globally (optional, but recommended for system-level management)
echo "📦 Checking PM2 installation..."
npm install pm2 --save-dev

# Start PM2 cluster (uses all CPU cores)
echo "🌐 Starting PM2 cluster mode (using all available CPU cores)..."
npx pm2 start ecosystem.config.js

# Save PM2 config for resurrection on reboot
echo "💾 Saving PM2 configuration..."
npx pm2 save

echo ""
echo "✅ PM2 Cluster Setup Complete!"
echo ""
echo "📊 Monitoring Commands:"
echo "  - View live metrics:    npm run monit"
echo "  - View logs:            npm run logs"
echo "  - Restart all:          npm run restart:cluster"
echo "  - Stop all:             npm run stop:cluster"
echo ""
echo "🔗 Status:"
npx pm2 status
