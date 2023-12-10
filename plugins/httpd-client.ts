export default defineNuxtPlugin(() => {
  const {
    public: { openFetch: clients },
  } = useRuntimeConfig()

  return {
    provide: Object.fromEntries(
      Object.entries(clients).map(([name, _client]) => [
        `${name}Fetch`,
        createOpenFetch((options) => ({
          ...clients.httpd,
          ...options,
          async onRequest(ctx) {
            return await options.onRequest?.(ctx)
          },
        })),
      ]),
    ),
  }
})
