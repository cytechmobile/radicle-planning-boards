export default defineNuxtPlugin(() => {
  const {
    public: { openFetch: clients },
  } = useRuntimeConfig()
  const baseUrl = useHttpdBaseUrl()
  const auth = useAuthStore()

  return {
    provide: Object.fromEntries(
      Object.entries(clients).map(([name, _client]) => [
        name,
        createOpenFetch((options) => ({
          ...clients.httpd,
          baseURL: baseUrl,
          headers: {
            ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
          },
          ...options,
        })),
      ]),
    ),
  }
})
