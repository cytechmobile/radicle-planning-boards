export default defineNuxtPlugin(() => {
  const {
    public: { openFetch: clients },
  } = useRuntimeConfig()
  const baseUrl = useHttpdBaseUrl()

  return {
    provide: Object.fromEntries(
      Object.entries(clients).map(([name, _client]) => [
        `${name}Fetch`,
        createOpenFetch((options) => ({
          ...clients.httpd,
          baseURL: baseUrl,
          ...options,
        })),
      ]),
    ),
  }
})
