// eslint.config.mjs
import { defineConfig } from 'eslint/config'
import { createConfigForNuxt } from '@nuxt/eslint-config'

export default defineConfig([
  // Nuxt’s base rules
  ...createConfigForNuxt({
    stylistic: {
      commaDangle: 'never',
      braceStyle: '1tbs'
    }
  }),
  // You can append more flat-config entries here…
])
