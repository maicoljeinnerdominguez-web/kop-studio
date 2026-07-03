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

# Build Next.js (also copies static + public into standalone)
RUN npm run build

# Copy schema.prisma into standalone output for runtime db push
RUN mkdir -p .next/standalone/prisma && cp prisma/schema.prisma .next/standalone/prisma/

# Also copy the generated Prisma client into standalone for runtime use
RUN cp -r node_modules/.prisma .next/standalone/node_modules/.prisma
RUN cp -r node_modules/@prisma .next/standalone/node_modules/@prisma

# === RUNNER STAGE ===
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# Install openssl + prisma CLI for runtime db push only
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g prisma@6.11.1

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./

# Copy static assets and public dir (already in standalone, but be explicit)
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# PORT is set by Railway (default 8080). Next.js standalone server.js reads this env var.
EXPOSE 3000

# Start: set DATABASE_URL, push schema (skip generate to avoid conflicts), start server
CMD ["sh", "-c", "DATABASE_URL=${POSTGRES_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}} && echo '=== Pushing DB schema...' && prisma db push --accept-data-loss --skip-generate 2>&1 && echo \"=== Starting Next.js on port ${PORT:-3000}...\" && exec node server.js"]