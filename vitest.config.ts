import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Same alias as tsconfig "paths", so route handlers can be imported in tests.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
