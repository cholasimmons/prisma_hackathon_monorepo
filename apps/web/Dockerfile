FROM oven/bun:1.3.5 AS build
WORKDIR /app

COPY package.json bun.lock* ./
COPY apps ./apps
COPY packages ./packages
# COPY . .

# Try frozen first, fallback to regular install
# RUN bun install --frozen-lockfile || (echo "⚠️ bun.lock outdated — regenerating..." && bun install)
RUN if ! bun install --frozen-lockfile; then \
      echo "⚠️ bun.lock outdated — regenerating..." && bun install; \
    fi

WORKDIR /app/apps/web
RUN bun run build

# Production stage
FROM oven/bun:1.3.5 AS production
WORKDIR /app

# Copy built files
COPY --from=build /app/apps/web/build ./build
COPY --from=build /app/apps/web/package.json ./

# Install only prod deps for runtime
# RUN bun install --production

ENV PORT=3001

# run the app
USER bun
EXPOSE 3001/tcp

CMD ["bun", "run", "start"]
