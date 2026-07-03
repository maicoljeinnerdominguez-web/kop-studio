# === BUILDER STAGE ===
FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy source code
COPY . .

# Patch Prisma schema from SQLite to PostgreSQL
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# Generate Prisma client for PostgreSQL
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Copy schema.prisma into standalone output for runtime use
RUN mkdir -p .next/standalone/prisma && cp prisma/schema.prisma .next/standalone/prisma/

# === RUNNER STAGE ===
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# Install openssl + prisma CLI for runtime db push
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g prisma@6.11.1

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static

# Copy public directory
COPY --from=builder /app/public ./public

EXPOSE 3000

# Start: set DATABASE_URL, push schema, start server
CMD ["sh", "-c", "DATABASE_URL=${POSTGRES_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}} && echo '=== Pushing DB schema...' && prisma db push --accept-data-loss 2>&1 && echo '=== Starting Next.js on port 3000...' && PORT=3000 exec node server.js"]