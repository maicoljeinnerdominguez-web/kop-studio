# === BUILDER STAGE ===
FROM node:22-slim AS builder

# Install Bun for building
RUN npm install -g bun@latest

WORKDIR /app

# 1. Install dependencies first (layer caching)
COPY package.json bun.lock ./
RUN bun install

# 2. Copy & patch Prisma schema (SQLite → PostgreSQL for production)
COPY prisma/ ./prisma/
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# 3. Generate Prisma client using the LOCAL prisma (6.11.1 from package.json)
#    Uses dummy DB URL just for client code generation (no real DB needed)
RUN DATABASE_URL='postgresql://x:x@x:5432/x' ./node_modules/.bin/prisma generate

# 4. Copy rest of the app and build
COPY . .
RUN bun run build

# 5. Copy Prisma schema into standalone dir so runtime can find it
RUN mkdir -p .next/standalone/prisma && \
    cp prisma/schema.prisma .next/standalone/prisma/

# === RUNNER STAGE ===
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# Install Prisma CLI globally with EXACT version (no 7.x surprises)
RUN npm install -g prisma@6.11.1

# Copy the entire standalone output (server + traced node_modules + static + public)
COPY --from=builder /app/.next/standalone ./

EXPOSE 3000

# Startup:
# 1. Build DATABASE_URL from Railway PostgreSQL plugin env vars
# 2. Write it to .env so Prisma reads it
# 3. Push schema to create/update tables
# 4. Start the Next.js server
CMD ["sh", "-c", "DB_URL=${POSTGRES_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}} && echo DATABASE_URL=$DB_URL > .env && prisma db push --accept-data-loss && exec node server.js"]