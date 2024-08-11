import { useStorage } from '@vueuse/core'

export const useAuthStore = defineStore('auth', () => {
  const isDebugging = useIsDebugging()
  const debuggingAuthToken = useStorage('RPB_config-auth-token', '')

  const token = ref<string>()
  const isAuthenticated = computed(() => Boolean(token.value))
  const postMessageToRadicleInterface = usePostMessageToRadicleInterface()

  if (!token.value) {
    postMessageToRadicleInterface({ type: 'request-auth-token' })
  }

  useRadicleInterfaceMessage('set-auth-token', (message) => {
    if (message.authToken && !(isDebugging.value && debuggingAuthToken.value)) {
      token.value = message.authToken
    }
  })

  useRadicleInterfaceMessage('remove-auth-token', () => {
    token.value = undefined
  })

  watchEffect(() => {
    if (isDebugging.value && debuggingAuthToken.value) {
      token.value = debuggingAuthToken.value
    }
  })

  const store = {
    token,
    isAuthenticated,
  }

  return store
})
