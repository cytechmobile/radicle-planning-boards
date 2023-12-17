export default defineNuxtPlugin(() => {
  const {
    public: { openFetch: clients },
  } = useRuntimeConfig()
  const baseUrl = useHttpdBaseUrl()
  const authToken = useAuthToken()

  return {
    provide: Object.fromEntries(
      Object.entries(clients).map(([name, _client]) => [
        `${name}Fetch`,
        createOpenFetch((options) => ({
          ...clients.httpd,
          baseURL: baseUrl,
          headers: {
            ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
          },
          ...options,
        })),
      ]),
    ),
  }
})
