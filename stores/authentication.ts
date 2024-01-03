/* eslint-disable prettier/prettier */

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)

  if (!token.value) {
    postMessageToRadicleInterface({ type: 'request-auth-token' })
  }

  useRadicleInterfaceMessage('set-auth-token', (message) => {
    if (message.authToken) {
      token.value = message.authToken
    }
  })

  useRadicleInterfaceMessage('remove-auth-token', () => {
    token.value = null
  })

  const store = {token}

  return store
})
