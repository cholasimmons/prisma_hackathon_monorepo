FROM oven/bun:1.3.4 AS base
# RUN apk add --no-cache git wget

WORKDIR /app

# --------------------------------------
# Install dependencies (dev + prod)
# --------------------------------------
FROM base AS install

# Dev dependencies
# RUN mkdir -p /temp/dev
COPY package.json bun.lock ./
RUN bun install # --frozen-lockfile

# --------------------------------------
# Build stage (with dev dependencies) + Generate Prisma
# --------------------------------------
FROM base AS build
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
# ENTRYPOINT [ "bun", "run", "server" ]

# COPY package.json bun.lock ./
# COPY . .
# RUN bun install # --frozen-lockfile
# RUN bun --bun run build

# FROM oven/bun:1.3.4 AS production
# WORKDIR /app
# COPY --from=build /app/build ./build
# COPY package.json bun.lock ./
# RUN bun install --production # --frozen-lockfile

# CMD ["bun", "run", "start"]
