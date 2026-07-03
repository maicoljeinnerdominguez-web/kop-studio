#!/bin/sh
# Railway production postinstall: patch schema + generate prisma client
if [ "$RAILWAY_ENVIRONMENT" = "production" ]; then
  echo "=== Railway detected: patching schema to PostgreSQL ==="
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
  DATABASE_URL='postgresql://x:x@x:5432/x' ./node_modules/.bin/prisma generate
else
  echo "=== Local dev: generating Prisma client ==="
  ./node_modules/.bin/prisma generate
fi
echo "=== Prisma client generated ==="