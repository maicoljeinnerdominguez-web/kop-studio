#!/bin/bash
cd /home/z/my-project
while true; do
  HOSTNAME=0.0.0.0 npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
  CHILD=$!
  # Keep child alive with periodic requests
  for i in $(seq 1 300); do
    sleep 4
    if ! kill -0 $CHILD 2>/dev/null; then break; fi
    curl -s --connect-timeout 1 -o /dev/null "http://localhost:3000/api/categories" 2>/dev/null
  done
  wait $CHILD 2>/dev/null
  sleep 2
done
