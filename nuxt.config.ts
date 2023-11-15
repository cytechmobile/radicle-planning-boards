// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/ui', 'nuxt-icon'],
  experimental: { typedPages: false },
  devtools: { enabled: true },
  ui: { global: true, icons: 'all' },
})
