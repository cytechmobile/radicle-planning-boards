import { radicleInterfaceOrigin } from './constants/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: [
    'nuxt-security',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/ui',
    'nuxt-icon',
    'nuxt-open-fetch',
  ],
  experimental: { typedPages: true },
  devtools: { enabled: true },
  security: {
    headers: {
      contentSecurityPolicy: {
        'frame-ancestors': ["'self'", radicleInterfaceOrigin],
      },
      xFrameOptions: false,
    },
  },
  ui: { global: true, icons: 'all' },
  routeRules: {
    '/': { redirect: '/seed.radicle.xyz:443/rad:z4V1sjrXqjvFdnCUbxPFqd5p4DtH5' },
  },
  openFetch: {
    disablePlugin: true,
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
