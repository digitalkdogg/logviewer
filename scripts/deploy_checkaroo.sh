#!/bin/sh

cd /Volume1/www/logviewer || exit 1

/usr/bin/python3 /Volume1/www/logviewer/deploy.py \
  --app checkaroo \
  --workdir /Volume1/www/checkaroo \
  --steps '[{"name": "cd", "cmd": "cd /Volume1/www/checkaroo"},{"name": "git_pull", "cmd": "git pull origin main"},{"name": "docker_stop", "cmd": "docker stop checkaroo", "ignore_error": true},{"name": "docker_rm", "cmd": "docker rm checkaroo", "ignore_error": true},{"name": "docker_build", "cmd": "docker build -t checkaroo ."},{"name": "docker_run", "cmd": "docker run -d --name checkaroo -p 3000:3000 --env-file .env checkaroo"}]'
