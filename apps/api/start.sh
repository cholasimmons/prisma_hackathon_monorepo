#!/bin/sh

# Fail fast
set -e

echo "Waiting for database..."

# Replace with your actual DB host + port
DB_HOST="${DATABASE_HOST:-q8g88cw8gssskowso4c8swg4}"
DB_PORT="${DATABASE_PORT:-5432}"

while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done

echo "Database ready."

echo "Applying Prisma migrations..."
bunx prisma migrate deploy

# Run Prisma seed
if [ -f ./prisma/seed.ts ] || [ -f ./prisma/seed.js ]; then
  echo "Seeding database..."
  bunx prisma db seed
else
  echo "No seed file found, skipping..."
fi

echo "Starting Elysia app..."
exec ./server # bun run ./dist/index.js
