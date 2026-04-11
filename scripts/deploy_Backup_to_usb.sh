#!/bin/sh

cd /Volume1/www/logviewer || exit 1

/usr/bin/python3 /Volume1/www/logviewer/scripts/deploy.py \
  --app Backup_to_usb \
  --workdir /Volume1/www/logviewer/scripts \
  --steps '[
  {"name": "Backup Documents", "cmd": "python3 /Volume1/www/logviewer/scripts/sync_dirs.py /Volume1/Documents /Volume1/@usb/usbshare_sdc1/Documents"},
  {"name": "Backup Movies",    "cmd": "python3 /Volume1/www/logviewer/scripts/sync_dirs.py /Volume1/Movies /Volume1/@usb/usbshare_sdc1/Movies"},
  {"name": "Backup www",       "cmd": "python3 /Volume1/www/logviewer/scripts/sync_dirs.py /Volume1/www /Volume1/@usb/usbshare_sdc1/www"},
  {"name": "Backup Projects",  "cmd": "python3 /Volume1/www/logviewer/scripts/sync_dirs.py /Volume1/Projects /Volume1/@usb/usbshare_sdc1/Projects"},
  {"name": "Backup Pictures",  "cmd": "python3 /Volume1/www/logviewer/scripts/sync_dirs.py /Volume1/Pictures /Volume1/@usb/usbshare_sdc1/Pictures"}
]'
