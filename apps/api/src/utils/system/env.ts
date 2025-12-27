import { Value } from '@sinclair/typebox/value'
import { t } from 'elysia'

// define your environment schema
const envSchema = t.Object({
  NODE_ENV: t.Enum({
    development: 'development',
    production: 'production',
    test: 'test',
  }),

  PORT: t.Numeric({ default: 3000 }),
  HOST: t.String({ default: '127.0.0.1' }),

  // --- Database ---
  DATABASE_USER: t.String({ default: 'postgres' }),
  DATABASE_PASSWORD: t.String({ default: 'postgres' }),
  DATABASE_PORT: t.Numeric({ default: 5432 }),
  DATABASE_NAME: t.String({ default: 'furrdb' }),
  DATABASE_URL: t.String({
    description: 'Postgres connection string',
  }),

  // --- Redis ---
  REDIS_URL: t.String({ description: 'full redis url + port' }),
  REDIS_PORT: t.Numeric({ default: 6379 }),

  // --- Auth ---
  JWT_SECRET: t.String({
    description: 'Secret used for JWT signing',
  }),
  SESSION_COOKIE_NAME: t.String({ default: 'sid' }),

  // --- BullMQ / Queueing ---
  BULLMQ_PREFIX: t.String({ default: 'app' }),

  // --- BetterAuth ---
  BETTER_AUTH_URL: t.String({
    default: 'http://localhost:3000',
    description: 'Base URL of your app (for auth callbacks)',
  }),
  BETTER_AUTH_SECRET: t.String({
    description: 'Secret key for BetterAuth',
  }),

  // --- S3 / Object Storage ---
  S3_ACCESS_KEY: t.String({ default: 'minioadmin' }),
  S3_SECRET_ACCESS_KEY: t.String({ default: 'minioadmin' }),
  S3_BUCKET: t.String({ default: 'furr-bucket' }),
  S3_ENDPOINT: t.String({ default: 'http://localhost:9000' }),

  // --- Axiom / Logging ---
  AXIOM_TOKEN: t.Optional(t.String()),
  AXIOM_DATASET: t.Optional(t.String()),
})

// validate the actual environment
const parseEnv = () => {
  const rawEnv = { ...process.env }

  // Validate
  const errors = [...Value.Errors(envSchema, rawEnv)]
  if (errors.length > 0) {
    console.error('❌ Invalid environment configuration:')
    for (const err of errors) {
      console.error(`  ${err.path}: ${err.message}`)
    }
    process.exit(1)
  }

  // Cast converts strings -> correct types (e.g., PORT="3000" -> 3000)
  return Value.Cast(envSchema, rawEnv)
}

// export the parsed, type-safe environment object
export const env = parseEnv()
