import { useStorage } from '@vueuse/core'

const defaultBaseUrl = 'https://app.radicle.xyz'

export function useHostAppBaseUrl(): string {
  const { baseUrl } = useRoute().query
  const configuredBaseUrl = useStorage('RPB_config-host-app-base-url', defaultBaseUrl)

  try {
    if (typeof baseUrl === 'string') {
      return new URL(baseUrl).origin
    }

    return new URL(configuredBaseUrl.value).origin
  } catch {
    return defaultBaseUrl
  }
}
