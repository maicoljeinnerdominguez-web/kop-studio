#!/bin/bash
if ! curl -s -o /dev/null http://localhost:3000/ 2>/dev/null; then
  # Kill any leftover processes
  pkill -f "next dev" 2>/dev/null
  pkill -f "next-server" 2>/dev/null
  sleep 1
  # Start server
  cd /home/z/my-project
  HOSTNAME=0.0.0.0 nohup bun run dev </dev/null >> /home/z/my-project/dev.log 2>&1 &
  echo "[$(date)] Server restarted" >> /home/z/my-project/server-restart.log
fi
