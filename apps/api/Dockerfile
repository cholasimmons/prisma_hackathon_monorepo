FROM oven/bun:1.3.4-alpine AS base
RUN apk add --no-cache git wget
WORKDIR /app

# --------------------------------------
# Install dependencies (dev + prod)
# --------------------------------------
FROM base AS install
COPY package.json bun.lock prisma tsconfig.json prisma.config.ts ./
RUN bun install
# --frozen-lockfile

# --------------------------------------
# Build stage (with dev dependencies) + Generate Prisma
# --------------------------------------
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .

# Debug before generating Prisma client
RUN echo "Listing /app contents:" && ls -la
RUN echo "Listing prisma folder:" && ls -la prisma || echo "No prisma directory"
RUN echo "Prisma CLI version:" && bunx prisma --version || echo "Prisma CLI not found"

RUN cat prisma/schema.prisma || echo "No schema.prisma file"

RUN ls -la node_modules/.bin/prisma || echo "Prisma CLI not installed!"
# RUN bun run prisma:generate

# Try to see the actual error
RUN bunx prisma generate || (echo "Prisma generate failed" && exit 1)

RUN bun run build

# -----------------------------
# Production (pure binary)
# -----------------------------
# FROM alpine:3.19 AS release
FROM oven/bun:1.3.4-alpine AS release
WORKDIR /app

# Copy binary
COPY --from=build /app/server ./server
# If Prisma is used, copy generated client runtime files
# (Prisma requires the query engine, even with a compiled server)
COPY --from=build /app/src/generated ./src/generated
COPY --from=build /app/prisma ./prisma
RUN chmod +x ./server

# ENV NODE_ENV=production
ENV PORT=3000

# run the app
# # Create non-root user (Alpine way)
RUN addgroup -g 1000 bun && adduser -u 1000 -G bun -s /bin/sh -D bun
RUN chown -R bun:bun /app
USER bun
EXPOSE 3000/tcp

CMD [ "./server" ]