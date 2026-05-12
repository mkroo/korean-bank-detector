import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/logos/symbol/*.ts', 'src/logos/wordmark/*.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  target: 'node20',
})
