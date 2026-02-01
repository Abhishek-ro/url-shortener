module.exports = {
  apps: [
    {
      name: 'boltlink-api',
      script: './dist/index.js',
      instances: process.env.WEB_CONCURRENCY || 1,
      exec_mode: 'fork',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      max_memory_restart: '300M',
      interpreter_args: '--max_old_space_size=256',
      env_production: { NODE_ENV: 'production' },
    },
    {
      name: 'boltlink-aggregator',
      script: './dist/worker/aggregator.worker.js',
      instances: 1,
      max_memory_restart: '100M',
      interpreter_args: '--max_old_space_size=80',
    },
    {
      name: 'boltlink-worker',
      script: './dist/worker/analytics.worker.js',
      instances: 1,
      max_memory_restart: '100M',
      interpreter_args: '--max_old_space_size=80',
    },
  ],
};
