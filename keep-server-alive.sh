#!/bin/bash
# Persistent server wrapper - keeps Next.js dev server alive
cd /home/z/my-project

while true; do
  echo "[$(date)] Starting dev server..."
  HOSTNAME=0.0.0.0 bun run dev >> /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 2s..."
  sleep 2
done