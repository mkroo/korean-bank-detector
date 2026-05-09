import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/data/logos.ts', 'src/logos/**'],
      thresholds: {
        lines: 95,
        statements: 95,
        branches: 90,
        functions: 95,
      },
    },
  },
})
