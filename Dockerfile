# === BUILDER STAGE (Node.js 22, no Bun needed) ===
FROM node:22-slim AS builder

WORKDIR /app

# 1. Install dependencies (npm resolves from package.json)
COPY package.json ./
RUN npm install

# 2. Copy & patch Prisma schema (SQLite → PostgreSQL for production)
COPY prisma/ ./prisma/
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# 3. Generate Prisma client using locally installed 6.11.1
RUN DATABASE_URL='postgresql://x:x@x:5432/x' ./node_modules/.bin/prisma generate

# 4. Copy rest of app and build Next.js
COPY . .
RUN npm run build

# 5. Copy Prisma schema into standalone dir for runtime
RUN mkdir -p .next/standalone/prisma && \
    cp prisma/schema.prisma .next/standalone/prisma/

# === RUNNER STAGE (minimal Node.js 22 + Prisma 6.11.1) ===
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# Install Prisma CLI globally with EXACT version 6.11.1
RUN npm install -g prisma@6.11.1

# Pre-download Prisma engine so runtime db push is fast (no download delay)
RUN prisma --version

# Copy the standalone output (server + traced deps + static + public)
COPY --from=builder /app/.next/standalone ./

EXPOSE 3000

# Startup script:
#   1. Build DATABASE_URL from Railway PostgreSQL plugin env vars
#   2. Write it to .env for Prisma to read
#   3. Push schema to create/update database tables
#   4. Start the Next.js server
CMD ["sh", "-c", "echo '=== KOP STUDIO STARTING ===' && DB_URL=${POSTGRES_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}} && echo DATABASE_URL=$DB_URL > .env && echo 'Running prisma db push...' && prisma db push --accept-data-loss && echo 'Starting Next.js server...' && exec node server.js"]