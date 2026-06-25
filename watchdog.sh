#!/bin/bash
# Watchdog script - keeps the server alive
while true; do
  echo "[$(date)] Starting server..."
  cd /home/z/my-project
  HOSTNAME=0.0.0.0 NODE_ENV=production node .next/standalone/server.js >> /home/z/my-project/server.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 2s..."
  sleep 2
done