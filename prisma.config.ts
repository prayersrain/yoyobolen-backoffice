import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

/**
 * Prisma 7 centralized configuration file.
 * We use 'dotenv' to load variables from .env.local manually
 * since Prisma 7 config doesn't auto-load them.
 */

type Env = {
  DATABASE_URL: string
  DIRECT_URL: string
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    // For Prisma 7 CLI (migrations/push), we MUST use the direct URL
    url: env<Env>('DIRECT_URL'), 
  },
})
