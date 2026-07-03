# === BUILDER STAGE (Node.js 22 only, no Bun) ===
FROM node:22-slim AS builder

WORKDIR /app

# 1. Install dependencies (npm resolves from package.json, ignores bun.lock)
COPY package.json ./
RUN npm install

# 2. Copy & patch Prisma schema (SQLite → PostgreSQL for production)
COPY prisma/ ./prisma/
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# 3. Generate Prisma client using locally installed 6.11.1
RUN DATABASE_URL='postgresql://x:x@x:5432/x' ./node_modules/.bin/prisma generate

# 4. Copy rest of app and build
COPY . .
RUN npm run build

# 5. Copy Prisma schema into standalone dir so runtime prisma finds it
RUN mkdir -p .next/standalone/prisma && \
    cp prisma/schema.prisma .next/standalone/prisma/

# === RUNNER STAGE (minimal Node.js 22 + Prisma CLI) ===
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# Install Prisma CLI globally with EXACT version 6.11.1 (no 7.x ever)
RUN npm install -g prisma@6.11.1

# Copy the standalone output (server + traced deps + static + public)
COPY --from=builder /app/.next/standalone ./

EXPOSE 3000

# Startup: set DB URL → write .env → push schema → start server
CMD ["sh", "-c", "DB_URL=${POSTGRES_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}} && echo DATABASE_URL=$DB_URL > .env && prisma db push --accept-data-loss && exec node server.js"]