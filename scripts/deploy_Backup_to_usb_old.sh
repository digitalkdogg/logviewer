#!/bin/sh

cd /Volume1/www/logviewer || exit 1

/usr/bin/python3 /Volume1/www/logviewer/deploy.py 
  --app Backup_to_usb 
  --workdir /Volume1/www/logviewer/scripts 
  --steps '[{"name": "Backup To USB", "cmd": "python3 /Volume1/www/logviewer/scripts/sync_dirs.py --config sync_config.json"}]'
