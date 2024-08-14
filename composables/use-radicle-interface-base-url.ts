import { useStorage } from '@vueuse/core'
import { defaultRadicleExplorerBaseUrl } from '~/constants/config'

export function useRadicleInterfaceBaseUrl(): string {
  const { baseUrl } = useRoute().query

  const configuredRadicleInterfaceBaseUrl = useStorage(
    'RPB_config-radicle-interface-base-url',
    defaultRadicleExplorerBaseUrl,
  )

  try {
    if (typeof baseUrl === 'string') {
      return new URL(baseUrl).origin
    }

    return new URL(configuredRadicleInterfaceBaseUrl.value).origin
  } catch {
    return defaultRadicleExplorerBaseUrl
  }
}
