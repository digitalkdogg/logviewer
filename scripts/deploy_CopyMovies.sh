#!/bin/sh

cd /Volume1/www/logviewer || exit 1

/usr/bin/python3 /Volume1/www/logviewer/deploy.py \
  --app CopyMovies \
  --workdir /Volume1/www/logviewer/scripts \
  --steps '[{"name": "copy_movies", "cmd": "python3 sync_dirs.py --config sync_config.json"}]'
