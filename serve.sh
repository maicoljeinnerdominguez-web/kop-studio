#!/bin/bash
cd /home/z/my-project
while true; do
  HOSTNAME=0.0.0.0 node .next/standalone/server.js 2>/dev/null
  sleep 0.3
done
