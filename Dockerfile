# === BUILDER STAGE ===
FROM node:22-slim AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY . .

# Patch Prisma schema AFTER COPY . . (not before, or COPY . . overwrites it)
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

RUN DATABASE_URL='postgresql://x:x@x:5432/x' ./node_modules/.bin/prisma generate

RUN npm run build

RUN mkdir -p .next/standalone/prisma && \
    cp prisma/schema.prisma .next/standalone/prisma/

# === RUNNER STAGE ===
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# Install openssl (needed by Prisma for PostgreSQL connections)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install Prisma CLI globally with EXACT version 6.11.1
RUN npm install -g prisma@6.11.1 && prisma --version

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./

EXPOSE 3000

CMD ["sh", "-c", "echo '=== KOP STUDIO STARTING ===' && DB_URL=${POSTGRES_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${POSTGRES_DATABASE}} && echo DATABASE_URL=$DB_URL > .env && echo 'Running prisma db push...' && prisma db push --accept-data-loss && echo 'Starting Next.js server...' && exec node server.js"]