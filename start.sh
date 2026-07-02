#!/bin/bash
# KOP STUDIO - Railway Startup Script
# This script ensures DATABASE_URL is correctly set for PostgreSQL

# Override .env with correct PostgreSQL URL from Railway plugin vars
# Railway PostgreSQL plugin provides: POSTGRES_URL, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DATABASE

if [ -n "$POSTGRES_URL" ]; then
  # Use the full URL if available
  DB_URL="$POSTGRES_URL"
elif [ -n "$POSTGRES_HOST" ]; then
  # Construct from individual vars
  DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}"
else
  echo "ERROR: No PostgreSQL configuration found. POSTGRES_URL or POSTGRES_HOST must be set."
  exit 1
fi

# Write correct DATABASE_URL to .env files (overriding any SQLite URL)
echo "DATABASE_URL=$DB_URL" > .env

# Copy to standalone dir if it exists
if [ -d ".next/standalone" ]; then
  echo "DATABASE_URL=$DB_URL" > .next/standalone/.env
fi

echo "DATABASE_URL configured successfully"

# Push schema to database
bunx prisma db push --accept-data-loss 2>&1
if [ $? -ne 0 ]; then
  echo "ERROR: prisma db push failed"
  exit 1
fi

# Start the server
exec node .next/standalone/server.js