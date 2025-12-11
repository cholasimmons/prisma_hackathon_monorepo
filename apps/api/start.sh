#!/bin/sh

# set -e # stop entire script on first error (Fail-fast)
# set -x # print every command before executing it

# Replace with your actual DB host + port
DB_HOST="${DATABASE_HOST}"
DB_PORT="${DATABASE_PORT}"

echo "🚀 Starting startup script..."

# Check if netcat is installed
if ! command -v nc >/dev/null 2>&1; then
    echo "Error: 'nc' is not installed in your Dockerfile."
    exit 1
fi

echo "⏳ Waiting for database at $DB_HOST:$DB_PORT..."
until nc -z "$DB_HOST" "$DB_PORT"; do
    echo "   ...DB not ready, retrying in 5s"
    sleep 5
done
echo "✅ Database is ready!"


# Apply Prisma migrations
echo "🛠  Applying Prisma migrations..."
bunx prisma migrate deploy

# Run Prisma seed
if [ -f ./prisma/seed.ts ] || [ -f ./prisma/seed.js ]; then
    echo "🌱 Seeding database..."
    bunx prisma db seed
else
    echo "⏩ No seed file found, skipping..."
fi

echo "🔥 Starting Elysia app..."

exec ./server # bun run ./dist/index.ts
