#!/bin/bash
cd /home/z/my-project
while true; do
  node_modules/.bin/next dev -p 3000
  sleep 1
done