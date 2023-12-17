import { useRadicleInterfaceMessage } from './use-radicle-interface-message'

export function useAuthToken() {
  const authToken = ref<string | null>(null)

  useRadicleInterfaceMessage('auth-token', (message) => {
    if (message.authToken) {
      authToken.value = message.authToken
    }
  })

  if (!authToken.value) {
    // Request an auth token from the Radicle Interface
    postMessageToRadicleInterface({ type: 'auth-token' })
  }

  return authToken
}

export function useIsAuthenticated() {
  const authToken = useAuthToken()
  const isAuthenticated = computed(() => !!authToken.value)

  return isAuthenticated
}
