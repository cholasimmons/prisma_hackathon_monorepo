FROM oven/bun:1.3.4 AS base
# RUN apk add --no-cache git wget netcat-openbsd curl
# vips vips-dev libc6-compat # sharp specific
RUN apt-get update && apt-get install -y \
    libvips \
    curl \
    netcat \
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
# This won't break the build either
# RUN cp bun.lock bun.lock 2>/dev/null || true

# Skip running postinstall scripts for now
# ENV npm_config_ignore_scripts=true

# RUN bun install
# Try frozen first, fallback to regular install
RUN bun install --frozen-lockfile 2>/dev/null || bun install

# --------------------------------------
# Build stage (with dev dependencies) + Generate Prisma
# --------------------------------------
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .

# Debug before generating Prisma client
# RUN echo "Listing /app contents:" && ls -la
# RUN echo "Listing prisma folder:" && ls -la prisma || echo "No prisma directory"
RUN echo "Prisma CLI version:" && bunx prisma --version || echo "Prisma CLI not found"

# RUN cat prisma/schema.prisma || echo "No schema.prisma file"

RUN ls -la node_modules/.bin/prisma || echo "Prisma CLI not installed!"
RUN bun run prisma:generate

RUN bun run build

# -----------------------------
# Production runtime
# -----------------------------
FROM base AS release
WORKDIR /app

# Copy binary
COPY --from=build /app/server ./server
# If Prisma is used, copy generated client runtime files
# (Prisma requires the query engine, even with a compiled server)
COPY --from=build /app/src/generated ./src/generated

# Copy Prisma schema (optional but recommended)
COPY --from=build /app/prisma ./prisma

# Copy start script
COPY --from=install /app/start.sh ./start.sh

COPY --from=build /app/node_modules ./node_modules

# Copy database adapter, dotenv and prisma
# COPY --from=install /app/node_modules/@prisma/adapter-pg ./node_modules/@prisma/adapter-pg
#COPY --from=install /app/node_modules/dotenv ./node_modules/dotenv
#COPY --from=install /app/node_modules/prisma ./node_modules/prisma
#COPY --from=install /app/node_modules/@prisma ./node_modules/@prisma

# Copy database config
COPY src/utils/database/client.ts ./src/utils/database/client.ts
# Copy prisma.config script
COPY --from=install /app/prisma.config.ts ./prisma.config.ts
# Copy static folder
COPY public ./public

RUN chmod +x ./server
RUN chmod +x ./start.sh

# ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fs http://localhost:3000/health || exit 1

# run the app

USER bun
EXPOSE 3000/tcp

ENTRYPOINT [ "./start.sh" ]
