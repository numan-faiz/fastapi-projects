module.exports = {
  apps: [{
    name: 'pizza-backend',
    script: 'python',
    args: '-m uvicorn main:app --host 127.0.0.1 --port 8000',
    cwd: 'E:\\full frontend and backend pizza deleivery system\\mini-services\\backend',
    interpreter: 'none',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      PYTHONUNBUFFERED: '1'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
