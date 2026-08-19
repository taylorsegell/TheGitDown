import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'entrypoints/**/*.test.{ts,tsx}'],
  },
})
