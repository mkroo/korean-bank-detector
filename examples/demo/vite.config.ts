import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves the site at https://<user>.github.io/<repo>/
  base: process.env.GITHUB_ACTIONS ? '/korean-bank-detector/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
