#!/bin/sh

cd /Volume1/www/logviewer || exit 1

/usr/bin/python3 /Volume1/www/logviewer/deploy.py 
  --app deepmoney_sync 
  --workdir /Volume1/www/moneygoup 
  --steps '[{"name": "deepmoney_sync", "cmd": "python3 deepmoney_sync.py"}]'
