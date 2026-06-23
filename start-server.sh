#!/bin/bash
cd /home/z/my-project
while true; do
  HOSTNAME=0.0.0.0 node .next/standalone/server.js 2>/tmp/srv-err.log
  sleep 0.5
done
