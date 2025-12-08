FROM oven/bun:1.3.4 AS base
# RUN apk add --no-cache git wget
WORKDIR /app

# --------------------------------------
# Install dependencies (dev + prod)
# --------------------------------------
FROM base AS install
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install # --frozen-lockfile

# --------------------------------------
# Build stage (with dev dependencies) + Generate Prisma
# --------------------------------------
FROM base AS build
WORKDIR /app
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN bun run prisma:generate
RUN bun run build

# -----------------------------
# Production (pure binary)
# -----------------------------
FROM alpine:3.19 AS release
WORKDIR /app

# Copy binary
COPY --from=build /app/server ./server
# If Prisma is used, copy generated client runtime files
# (Prisma requires the query engine, even with a compiled server)
COPY --from=build /app/src/generated ./src/generated
RUN chmod +x ./server

# ENV NODE_ENV=production
ENV PORT=3000

# run the app
USER bun
EXPOSE 3000/tcp

CMD [ "./server" ]