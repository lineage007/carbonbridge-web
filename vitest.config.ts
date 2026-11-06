import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // tsconfig keeps "jsx": "preserve" for Next; tests that import pages need it compiled.
  oxc: { jsx: { runtime: 'automatic' } },
  resolve: {
    // Same alias as tsconfig "paths", so route handlers can be imported in tests.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
