# -----------------------------
# Base image
# -----------------------------
FROM oven/bun:1.3.4 AS base

RUN apt-get update && apt-get install -y \
    libvips \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --------------------------------------
# Install dependencies (dev + prod)
# --------------------------------------
FROM base AS install
COPY package.json prisma start.sh tsconfig.json prisma.config.ts ./
COPY bun.lock* ./

# if bun.lock exists, good; if not, it won't break
RUN if [ -f bun.lock ]; then echo "Lockfile found and copied"; else echo "No lockfile present"; fi

# Install all dependencies, including optional (Sharp)
RUN bun install --frozen-lockfile 2>/dev/null || bun install
RUN bun install --include=optional --os=linux --cpu=x64 sharp

# --------------------------------------
# Build stage (with dev dependencies) + Generate Prisma
# --------------------------------------
FROM base AS build
COPY --from=install /app/node_modules ./node_modules

# Copy source code
COPY . .

# Debug: Prisma CLI check
RUN echo "Prisma CLI version:" && bunx prisma --version || echo "Prisma CLI not found"

# Generate Prisma client
RUN ls -la node_modules/.bin/prisma || echo "Prisma CLI not installed!"
RUN bun run prisma:generate

# Build Bun server (single executable)
RUN bun run build

# -----------------------------
# Production runtime
# -----------------------------
FROM base AS release
WORKDIR /app

# Copy binary
COPY --from=build /app/server ./server

# Copy Prisma client runtime
COPY --from=build /app/src/generated ./src/generated

# Copy Prisma schema (optional but recommended)
COPY --from=build /app/prisma ./prisma

# Copy start script
COPY --from=install /app/start.sh ./start.sh

# Copy all runtime dependencies
COPY --from=build /app/node_modules ./node_modules

# Copy database config
COPY src/utils/database/client.ts ./src/utils/database/client.ts
# Copy prisma.config script
COPY --from=install /app/prisma.config.ts ./prisma.config.ts

# Copy static folder
COPY public ./public

# Make executables runnable
RUN chmod +x ./server
RUN chmod +x ./start.sh

# ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck for Coolify
# HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
#     CMD curl -fs http://localhost:3000/health || exit 1

# run the app as non-root
USER bun
EXPOSE 3000/tcp

ENTRYPOINT [ "./start.sh" ]
