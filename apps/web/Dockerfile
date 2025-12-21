FROM oven/bun:1.3.5 AS build
WORKDIR /app

COPY package.json bun.lock* ./
COPY . .

# Try frozen first, fallback to regular install
RUN bun install --frozen-lockfile || (echo "⚠️ bun.lockb outdated — regenerating..." && bun install)
RUN bun run build

# Production stage
FROM base AS production
WORKDIR /app

# Copy built files
COPY --from=build /app/build ./build
COPY package.json ./

# Install only prod deps for runtime
RUN bun install --production

ENV PORT=3001

# run the app
USER bun
EXPOSE 3001/tcp

CMD ["bun", "run", "start"]
