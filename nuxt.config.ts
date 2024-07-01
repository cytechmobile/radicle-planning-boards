import process from 'node:process'

const defaultParentOrigin = 'http://localhost:3080'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devServer: {
    port: 4000,
  },
  modules: [
    'nuxt-security',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/ui',
    'nuxt-icon',
    '@nuxtjs/google-fonts',
    'nuxt-open-fetch',
    '@nuxt/test-utils/module',
  ],
  experimental: { typedPages: true },
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      parentOrigin: defaultParentOrigin,
    },
  },
  app: {
    head: {
      bodyAttrs: {
        class: 'overflow-y-hidden',
      },
    },
  },
  security: {
    headers: {
      // Allow nuxt devtools
      crossOriginEmbedderPolicy:
        process.env['NODE_ENV'] === 'development' ? 'unsafe-none' : 'require-corp',
      contentSecurityPolicy: {
        'frame-ancestors': [
          "'self'",
          process.env?.['NUXT_PUBLIC_PARENT_ORIGIN'] ?? defaultParentOrigin,
        ],
      },
      xFrameOptions: false,
    },
  },
  googleFonts: {
    families: {
      'Inter': '100..900',
      'JetBrains Mono': '100..800',
    },
  },
  ui: { global: true, icons: 'all' },
  routeRules: {
    '/': { redirect: '/seed.radicle.xyz:443/rad:z4V1sjrXqjvFdnCUbxPFqd5p4DtH5' },
  },
  openFetch: {
    disableNuxtPlugin: true,
    clients: {
      httpd: {
        schema:
          'https://seed.rhizoma.dev/raw/rad:z3yQUb9HDAC7TQrUDGkQsXDsYFj9G/b12552cf6803ecb9ddab58714b571684465dfe6d/api/radicle-httpd.yaml',
        baseURL: 'http://127.0.0.1:8080/api/v1',
        query: {
          perPage: 1000,
        },
      },
    },
  },
})
