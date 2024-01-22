import { useStorage } from '@vueuse/core'

export function useIsDebugging() {
  const isDebugging = useStorage('RPB_config-is-debugging', false)

  return isDebugging
}
