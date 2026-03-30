#!/bin/sh

cd /Volume1/www/logviewer || exit 1

/usr/bin/python3 /Volume1/www/logviewer/deploy.py \
  --app CopyMovies \
  --workdir /Volume1/www/logviewer/scripts \
  --steps '[{"name": "copy_movies", "cmd": "python3 /Volume1/www/logviewer/scripts/sync_dirs.py /Volume1/Movies /Volume1/@usb/usbshare_sdc1/Movies"}]'
