FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY . .
RUN bun install # --frozen-lockfile
RUN bun run build

# Production stage
FROM oven/bun:1 AS production
WORKDIR /app

# Copy built files
COPY --from=build /app/build ./build
COPY package.json bun.lock ./

# Install only prod deps for runtime
RUN bun install #--production # --frozen-lockfile

ENV PORT=3001
# run the app
USER bun
EXPOSE 3001/tcp
CMD ["bun", "run", "start"]
