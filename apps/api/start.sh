#!/bin/sh

# Fail fast
set -e
set -x

# Replace with your actual DB host + port
DB_HOST="${DATABASE_HOST:-tkgcg48cg8w0wk4sw8gw8wcc}"
DB_PORT="${DATABASE_PORT:-5432}"

echo "Waiting for database at $DB_HOST:$DB_PORT..."

while ! nc -z "$DB_HOST" "$DB_PORT"; do
    echo "DB not ready, retrying in 3s..."
    sleep 3
done

echo "Database ready."

# Apply Prisma migrations
echo "Applying Prisma migrations..."
bunx prisma migrate deploy

# Run Prisma seed
if [ -f ./prisma/seed.ts ] || [ -f ./prisma/seed.js ]; then
  echo "Seeding database..."
  bunx prisma db seed
else
  echo "No seed file found, skipping..."
fi

echo "Loading Elysia app..."
exec ./server # bun run ./dist/index.ts
