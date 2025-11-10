// PM2 Ecosystem Configuration for Monity Backend
// This file configures PM2 process manager for production deployment

module.exports = {
  apps: [
    {
      name: 'monity-backend',
      script: './server.js',
      instances: 1, // Use 1 for t3.micro, can scale with larger instances
      exec_mode: 'fork', // Use 'cluster' with multiple instances
      
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      
      // Auto-restart configuration
      watch: false, // Don't watch in production
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced features
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Cron jobs are handled by node-cron inside the app
      // PM2 just keeps the process alive
    }
  ],
  
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-ec2-instance-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/monity.git',
      path: '/home/ubuntu/monity-backend',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};

