export default defineNuxtPlugin(() => {
  const {
    public: { openFetch: clients },
  } = useRuntimeConfig()
  const baseUrl = useHttpdBaseUrl()
  const auth = useAuthStore()

  // TODO: zac placeholder, remove once mutations have been added
  watchEffect(() => {
    if (auth.token) {
      // eslint-disable-next-line no-console
      console.log(`Authenticated with token "${auth.token}"`)
    } else {
      // eslint-disable-next-line no-console
      console.log(`Unauthenticated`)
    }
  })

  return {
    provide: Object.fromEntries(
      Object.entries(clients).map(([name, _client]) => [
        `${name}Fetch`,
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
