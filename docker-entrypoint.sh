#!/bin/sh
echo "=== KOP STUDIO STARTING ==="

# CRITICAL: Force Next.js to bind to 0.0.0.0 (all interfaces)
# Docker sets HOSTNAME to container ID, which breaks Next.js binding
export HOSTNAME="0.0.0.0"

# Set DATABASE_URL
export DATABASE_URL="${POSTGRES_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}}"

# Push schema to database
echo "=== Pushing DB schema... ==="
prisma db push --accept-data-loss --skip-generate 2>&1
echo "=== DB schema push complete ==="

echo "PORT=$PORT HOSTNAME=$HOSTNAME"
echo "=== Starting Next.js ==="
exec node server.js