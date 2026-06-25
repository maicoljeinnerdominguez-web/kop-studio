#!/bin/bash
cd /home/z/my-project/.next/standalone
while true; do
  HOSTNAME=0.0.0.0 node server.js >> /home/z/my-project/dev.log 2>&1
  sleep 2
done
