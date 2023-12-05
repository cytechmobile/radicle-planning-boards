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
            // TODO: delete, only for demo purposes
            console.log('My logging', ctx.request) // eslint-disable-line no-console

            return await options.onRequest?.(ctx)
          },
        })),
      ]),
    ),
  }
})
