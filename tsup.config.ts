import { defineConfig } from 'tsup'
import { globSync } from 'node:fs'

const logoEntries = globSync('src/logos/*.ts')

export default defineConfig({
  entry: ['src/index.ts', ...logoEntries],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  target: 'node20',
})
