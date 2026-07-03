#!/bin/sh
set -e

echo "=== KOP STUDIO STARTING ==="

# Set DATABASE_URL
export DATABASE_URL="${POSTGRES_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}}"
echo "DATABASE_URL is set"

# Push schema to database
echo "=== Pushing DB schema... ==="
prisma db push --accept-data-loss --skip-generate 2>&1 || echo "WARN: prisma db push failed"
echo "=== DB schema push complete ==="

# Verify server.js exists
echo "Files in /app:"
ls -la /app/server.js
ls /app/.next/ | head -5
echo "NODE_ENV=$NODE_ENV"
echo "PORT=$PORT"

# Start Next.js in background
echo "=== Starting Next.js on port ${PORT:-3000} ==="
node server.js &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to be ready
echo "Waiting for server to start..."
sleep 3

# Self-test
echo "=== Self-test: curl localhost:${PORT:-3000} ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:${PORT:-3000}/ 2>&1 || echo "SELF-TEST FAILED"

# Keep container alive by waiting on the server process
echo "=== Container running, waiting for server process ==="
wait $SERVER_PID