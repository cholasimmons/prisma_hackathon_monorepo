FROM oven/bun:1.3.4 AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:1.3.4 AS production
WORKDIR /app
COPY --from=build /app/build ./build
COPY package.json bun.lock ./
ENV NODE_ENV=production
RUN bun install --production --frozen-lockfile

CMD ["bun", "run", "start"]
