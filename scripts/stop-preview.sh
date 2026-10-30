#!/bin/sh
# Stops every wrangler and workerd process this project's `pnpm start` left running.
# Killing only the process on the port leaves the rest behind, and they pile up.
ps -Ao pid=,command= | grep -E "$(pwd)/node_modules/.*(wrangler|workerd)" | grep -v grep | awk '{print $1}' | while read -r pid; do
  kill "$pid"
done
