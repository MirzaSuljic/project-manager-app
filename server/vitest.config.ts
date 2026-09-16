import { config } from 'dotenv'
import { defineConfig } from 'vitest/config'

const testEnv = config({ path: '.env.test', quiet: true }).parsed ?? {}

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    env: testEnv,
    fileParallelism: false,
    pool: 'forks',
    maxWorkers: 1,
    hookTimeout: 30000,
    testTimeout: 30000,
  },
})
