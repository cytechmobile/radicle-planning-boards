import { useStorage } from '@vueuse/core'

export const useAuthStore = defineStore('auth', () => {
  const hostAppAuthToken = ref<string>()
  const isDebugging = useIsDebugging()
  const debuggingAuthToken = useStorage('RPB_config-auth-token', '')

  const authToken = computed(() => {
    return isDebugging.value && debuggingAuthToken.value
      ? debuggingAuthToken.value
      : hostAppAuthToken.value
  })
  const isAuthenticated = computed(() => Boolean(authToken.value))

  const { onHostAppMessage, postMessageToHostApp } = useHostAppMessage()

  if (!hostAppAuthToken.value) {
    postMessageToHostApp({ type: 'request-auth-token' })
  }

  onHostAppMessage('set-auth-token', (message) => {
    hostAppAuthToken.value = message.authToken
  })

  onHostAppMessage('remove-auth-token', () => {
    hostAppAuthToken.value = undefined
  })

  const store = {
    token: authToken,
    isAuthenticated,
  }

  return store
})
