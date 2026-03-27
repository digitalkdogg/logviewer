#!/bin/sh

cd /Volume1/www/logviewer || exit 1

/usr/bin/python3 /Volume1/www/logviewer/deploy.py \
  --app moneygoup \
  --workdir /Volume1/www/moneygoup \
  --steps '[{"name": "git_pull", "cmd": "git pull origin main"},{"name": "sync_script", "cmd": "python3 deepmoney_sync.py"},{"name": "docker_stop", "cmd": "docker stop moneygoup", "ignore_error": true},{"name": "docker_rm", "cmd": "docker rm moneygoup", "ignore_error": true},{"name": "docker_build", "cmd": "docker build -t moneygoup ."},{"name": "docker_run", "cmd": "docker run -d --name moneygoup -p 3001:3001 --env-file .env.production moneygoup"}]'
