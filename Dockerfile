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

# Build Next.js (also copies static + public into standalone via build script)
RUN npm run build

# Copy schema.prisma into standalone output for runtime db push
RUN mkdir -p .next/standalone/prisma && cp prisma/schema.prisma .next/standalone/prisma/

# Copy the generated Prisma engine + client into standalone for runtime
RUN cp -r node_modules/.prisma .next/standalone/node_modules/.prisma
RUN cp -r node_modules/@prisma .next/standalone/node_modules/@prisma

# === RUNNER STAGE ===
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# Install openssl + curl for Prisma runtime and debugging
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Install prisma CLI globally for db push
RUN npm install -g prisma@6.11.1

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# PORT is set by Railway (default 8080). Next.js standalone reads this env var.
EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]