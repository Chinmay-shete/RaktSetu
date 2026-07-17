module.exports = {
  apps: [
    {
      name: 'raktsetu-api',
      script: './server.js',
      instances: 'max',          // Use ALL available CPU cores
      exec_mode: 'cluster',      // Fork a worker per core
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Auto-restart on crash with exponential backoff
      min_uptime: '5s',
      max_restarts: 10,
      restart_delay: 2000,
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      combine_logs: true,
      // Zero-downtime reload
      wait_ready: true,
      shutdown_with_message: true
    }
  ]
};
