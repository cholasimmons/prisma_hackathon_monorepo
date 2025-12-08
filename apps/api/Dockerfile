FROM oven/bun:1.3.4-alpine AS base
RUN apk add --no-cache git wget

WORKDIR /app

# --------------------------------------
# Install dependencies (dev + prod)
# --------------------------------------
FROM base AS install

# Dev dependencies
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install # --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
RUN chown -R bun:bun /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install # --production #--frozen-lockfile

# --------------------------------------
# Build stage (with dev dependencies)
# --------------------------------------
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
# # Generate Prisma client
RUN bun run generate
# RUN bun test

# Build your app (TypeScript, SvelteKit, etc.)
# RUN bun run build

# --------------------------------------
# Production stage (only runtime dependencies + build output)
# --------------------------------------
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
# COPY --from=prerelease /app/build ./build
# Optionally copy static assets if needed:
# COPY --from=prerelease /usr/src/app/public ./public

# ENV NODE_ENV=production
ENV PORT=3000

# run the app
USER bun
EXPOSE 3000/tcp

ENTRYPOINT [ "bun", "run", "start" ]

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
