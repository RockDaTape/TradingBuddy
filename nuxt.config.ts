// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui-pro',
    '@vueuse/nuxt',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxtjs/supabase'
  ],

  components: {
    dirs: [
      '~/components'
    ]
  },


  supabase: {
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_ANON_KEY!,
    redirect: false,      // disable automatic /login redirects
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-07-11',

  // 1) Make sure Vite includes these in the SSR bundle
  vite: {
    ssr: {
      noExternal: [
        '@tiptap/vue-3',
        '@tiptap/starter-kit',
        '@tiptap/extension-color'
      ],
    },
  },

  // 2) (Optional but safe) Transpile them too
  build: {
    transpile: [
      '@tiptap/vue-3',
      '@tiptap/starter-kit',
      '@tiptap/extension-color'
    ],
  },

})
