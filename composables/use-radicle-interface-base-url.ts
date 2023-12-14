import { useStorage } from '@vueuse/core'

export function useRadicleInterfaceBaseUrl(): string {
  const defaultRadicleInterfaceBaseUrl = 'https://app.radicle.xyz'

  const configuredRadicleInterfaceBaseUrl = useStorage(
    'RPB_config-radicle-interface-base-url',
    defaultRadicleInterfaceBaseUrl,
  )

  try {
    return new URL(configuredRadicleInterfaceBaseUrl.value).origin
  } catch {
    return defaultRadicleInterfaceBaseUrl
  }
}
