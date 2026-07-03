# === BUILDER STAGE ===
FROM node:22-slim AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY . .

# Patch Prisma schema AFTER COPY . . (not before, or it gets overwritten)
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

RUN DATABASE_URL='postgresql://x:x@x:5432/x' ./node_modules/.bin/prisma generate

RUN npm run build

RUN mkdir -p .next/standalone/prisma && \
    cp prisma/schema.prisma .next/standalone/prisma/

# === RUNNER STAGE ===
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# Install PostgreSQL + openssl + Prisma CLI
RUN apt-get update -y && \
    apt-get install -y postgresql openssl && \
    rm -rf /var/lib/apt/lists/*

# Install Prisma CLI with exact version
RUN npm install -g prisma@6.11.1 && prisma --version

# Copy standalone app
COPY --from=builder /app/.next/standalone ./

# Setup PostgreSQL: allow trust auth, init database
RUN PGVER=$(ls /etc/postgresql/ | head -1) && \
    echo "local all all trust" > /etc/postgresql/$PGVER/main/pg_hba.conf && \
    echo "host  all all 127.0.0.1/32 trust" >> /etc/postgresql/$PGVER/main/pg_hba.conf && \
    echo "host  all all ::1/128 trust" >> /etc/postgresql/$PGVER/main/pg_hba.conf && \
    pg_ctlcluster $PGVER main start && \
    su - postgres -c "createdb kopstudio" && \
    pg_ctlcluster $PGVER main stop

EXPOSE 3000

# Startup: start PostgreSQL → push schema → seed → start Next.js
CMD ["sh", "-c", "\
PGVER=$(ls /etc/postgresql/ | head -1) && \
echo '=== KOP STUDIO STARTING ===' && \
echo 'Starting PostgreSQL...' && \
pg_ctlcluster $PGVER main start && \
sleep 2 && \
echo DATABASE_URL=postgresql://postgres@localhost:5432/kopstudio > .env && \
echo 'Running prisma db push...' && \
prisma db push --accept-data-loss && \
echo 'Starting Next.js server...' && \
exec node server.js"]