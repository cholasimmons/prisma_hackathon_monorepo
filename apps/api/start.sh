#!/bin/sh

# set -e # stop entire script on first error (Fail-fast)
# set -x # print every command before executing it

echo "📦 Bun version:"
bun --version

echo "🔍 Prisma Engine versions:"
bunx prisma version

echo "📁 Current working directory:"
pwd

echo "📂 Directory listing (root):"
ls -la

echo "📂 prisma/ directory:"
ls -la prisma/ 2>/dev/null || echo "⚠️ prisma/ not found"

echo "📂 src/ directory:"
ls -la src/ 2>/dev/null || echo "⚠️ src/ not found"

# echo "📄 prisma/schema.prisma (if exists):"
# cat prisma/schema.prisma 2>/dev/null || echo "⚠️ schema.prisma not found"

echo "📄 prisma.config.ts (if exists):"
cat prisma.config.ts 2>/dev/null || cat prisma/prisma.config.ts 2>/dev/null || echo "⚠️ prisma.config.ts not found in either locations"

echo "📦 prisma/client (if exists):"
ls -la src/generated/prisma/client 2>/dev/null || echo "⚠️ Prisma Client not generated (yet)"

# Replace with your actual DB host + port
DB_HOST="${DATABASE_HOST}"
DB_PORT="${DATABASE_PORT}"
DB_URL="${DATABASE_URL}"
ENV="${NODE_ENV}"

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
echo "🛠  Applying Prisma migrations to $DB_URL"
bunx prisma migrate deploy

# Run Prisma seed
if [ -f ./prisma/seed.ts ] || [ -f ./prisma/seed.js ]; then
    bun ./prisma/seed.ts
else
    echo "⏩ No seed file found, skipping..."
fi

echo "🔥 Starting Elysia app in $ENV..."

# exec ./server # for single executable
exec bun run ./build/index.js
