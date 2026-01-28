@echo off
REM BoltLink PM2 Cluster Setup Script (Windows)
REM Prepares PM2 cluster mode for production multi-core scaling

echo.
echo 🚀 Setting up PM2 Cluster Mode for BoltLink Backend...
echo.

REM Create logs directory
if not exist "logs" mkdir logs
echo 📁 Created logs directory

REM Build TypeScript
echo.
echo 🔨 Building TypeScript...
call npm run build

REM Install PM2 globally (optional)
echo.
echo 📦 Checking PM2 installation...
call npm install pm2 --save-dev

REM Start PM2 cluster (uses all CPU cores)
echo.
echo 🌐 Starting PM2 cluster mode (using all available CPU cores)...
call npx pm2 start ecosystem.config.js

REM Save PM2 config for resurrection on reboot
echo.
echo 💾 Saving PM2 configuration...
call npx pm2 save

echo.
echo ✅ PM2 Cluster Setup Complete!
echo.
echo 📊 Monitoring Commands:
echo   - View live metrics:    npm run monit
echo   - View logs:            npm run logs
echo   - Restart all:          npm run restart:cluster
echo   - Stop all:             npm run stop:cluster
echo.
echo 🔗 Status:
call npx pm2 status
