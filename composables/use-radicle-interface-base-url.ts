import { useStorage } from '@vueuse/core'

export function useRadicleInterfaceBaseUrl(): string {
  const defaultRadicleInterfaceBaseUrl = 'https://app.radicle.xyz'

  const { baseUrl } = useRoute().query

  const configuredRadicleInterfaceBaseUrl = useStorage(
    'RPB_config-radicle-interface-base-url',
    defaultRadicleInterfaceBaseUrl,
  )

  try {
    if (typeof baseUrl === 'string') {
      return new URL(baseUrl).origin
    }

    return new URL(configuredRadicleInterfaceBaseUrl.value).origin
  } catch {
    return defaultRadicleInterfaceBaseUrl
  }
}
