// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/ui', 'nuxt-icon', 'nuxt-open-fetch'],
  experimental: { typedPages: true },
  devtools: { enabled: true },
  ui: { global: true, icons: 'all' },
  openFetch: {
    disablePlugin: true,
    clients: {
      httpd: {
        schema:
          'https://seed.rhizoma.dev/raw/rad:z3yQUb9HDAC7TQrUDGkQsXDsYFj9G/b12552cf6803ecb9ddab58714b571684465dfe6d/api/radicle-httpd.yaml',
        baseURL: 'https://seed.radicle.xyz/api/v1',
      },
    },
  },
})
