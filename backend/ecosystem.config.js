const os = require('os');

module.exports = {
  apps: [
    {
      name: 'boltlink-api',
      script: './dist/index.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // Performance & reliability
      max_memory_restart: '500M', // Restart instance if memory > 500MB
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
      watch: false, // Disable watch mode in production
      ignore_watch: ['node_modules', 'dist', '.git', '.env'],
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
      shutdown_with_message: true,
      // Logging
      output: './logs/out.log',
      error: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: false,
      // Advanced clustering
      cwd: './',
      interpreter: 'node',
      interpreter_args: '--max_old_space_size=1024', // 1GB heap per worker
      node_args: '--enable-source-maps',
      // Health check (for load balancer)
      instance_var: 'INSTANCE_ID',
    },
    {
      name: 'boltlink-aggregator',
      script: './dist/worker/aggregator.worker.js',
      instances: 1,
      exec_mode: 'fork', // Single instance aggregator
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
      output: './logs/aggregator-out.log',
      error: './logs/aggregator-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      interpreter_args: '--max_old_space_size=512',
    },
    {
      name: 'boltlink-worker',
      script: './dist/worker/analytics.worker.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
      output: './logs/worker-out.log',
      error: './logs/worker-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      interpreter_args: '--max_old_space_size=512',
    },
  ],

  // Global settings
  monitor_interval: 5000,
  max_restarts: 10,
  min_uptime: '10s',
  autorestart: true,
};
