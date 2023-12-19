import { useRadicleInterfaceMessage } from './use-radicle-interface-message'

export function useAuthToken() {
  const authToken = ref<string | null>(null)

  if (!authToken.value) {
    postMessageToRadicleInterface({ type: 'request-auth-token' })
  }

  useRadicleInterfaceMessage('set-auth-token', (message) => {
    if (message.authToken) {
      authToken.value = message.authToken
    }
  })

  useRadicleInterfaceMessage('remove-auth-token', () => {
    authToken.value = null
  })

  return authToken
}

export function useIsAuthenticated() {
  const authToken = useAuthToken()
  const isAuthenticated = computed(() => !!authToken.value)

  return isAuthenticated
}
