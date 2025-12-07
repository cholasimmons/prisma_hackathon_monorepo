FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:1 AS production
WORKDIR /app

COPY --from=build /app/build ./build
COPY package.json bun.lock ./

# Install only prod deps for runtime
RUN bun install --production --frozen-lockfile

ENV PORT=3001
EXPOSE 3001

CMD ["bun", "run", "start"]
