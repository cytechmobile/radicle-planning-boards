export default defineNuxtPlugin(() => {
  const {
    public: { openFetch: clients },
  } = useRuntimeConfig()
  const baseUrl = useHttpdBaseUrl()
  const authToken = useAuthToken()

  // TODO: zac placeholder, remove once mutations have been added
  watchEffect(() => {
    if (authToken.value) {
      // eslint-disable-next-line no-console
      console.log(`Authenticated with token "${authToken.value}"`)
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
            ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
          },
          ...options,
        })),
      ]),
    ),
  }
})
