import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      // institutions.ts holds declarative pattern data with many small arrow functions
      // (additionalRules) that are only exercised in production matching. We assert
      // structural integrity via tests/institutions.test.ts and skip line/function
      // coverage on this data file.
      exclude: ['src/data/logos.ts', 'src/data/institutions.ts', 'src/logos/**'],
      thresholds: {
        lines: 95,
        statements: 95,
        branches: 90,
        functions: 95,
      },
    },
  },
})
