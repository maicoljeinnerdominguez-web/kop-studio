#!/bin/sh
# KOP STUDIO - Production Entrypoint
set -e

# CRITICAL: Force Next.js to bind to 0.0.0.0 (all interfaces)
# Docker sets HOSTNAME to container ID which breaks binding
export HOSTNAME="0.0.0.0"

# Set DATABASE_URL from Railway Postgres env vars
export DATABASE_URL="${POSTGRES_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}}"

# Sync Prisma schema to database
prisma db push --accept-data-loss --skip-generate

# Start Next.js
exec node server.js