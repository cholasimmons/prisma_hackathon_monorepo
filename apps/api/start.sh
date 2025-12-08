#!/bin/sh

# Fail fast
set -e

echo "Waiting for database..."

# Replace with your actual DB host + port
DB_HOST="${DATABASE_HOST:-db}"
DB_PORT="${DATABASE_PORT:-5432}"

while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done

echo "Database ready."

echo "Applying Prisma migrations..."
bunx prisma migrate deploy

echo "Starting Elysia app..."
exec ./server # bun run ./dist/index.js
