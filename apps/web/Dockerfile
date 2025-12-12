FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock* ./
COPY . .

# Try frozen first, fallback to regular install
RUN bun install --frozen-lockfile 2>/dev/null || bun install
RUN bun run build

# Production stage
FROM oven/bun:1 AS production
WORKDIR /app

# Copy built files
COPY --from=build /app/build ./build
COPY package.json bun.lock* ./

# Install only prod deps for runtime
RUN bun install --production --frozen-lockfile 2>/dev/null || bun install --production

# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "-f", "http://localhost:3000/health" ]

ENV PORT=3001

# run the app
USER bun
EXPOSE 3001/tcp

CMD ["bun", "run", "start"]
