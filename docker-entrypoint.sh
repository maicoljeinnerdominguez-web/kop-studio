#!/bin/sh
set -e

echo "=== KOP STUDIO STARTING ==="

# Set DATABASE_URL
export DATABASE_URL="${POSTGRES_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}}"
echo "DATABASE_URL is set"

# Push schema to database
echo "=== Pushing DB schema... ==="
npx prisma db push --accept-data-loss --skip-generate 2>&1 || echo "WARN: prisma db push failed, continuing anyway"
echo "=== DB schema push complete ==="

# Verify server.js exists
echo "Files in /app:"
ls -la /app/server.js 2>&1 || echo "ERROR: server.js not found!"
ls -la /app/.next/ 2>&1 | head -5

# Start Next.js
echo "=== Starting Next.js on port ${PORT:-3000} ==="
exec node server.js 2>&1